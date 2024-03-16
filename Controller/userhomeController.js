

//Importing models
const Products = require('../model/product')
const Banners = require('../model/banner')
const Cart = require('../model/cart')
const Users = require('../model/users')
const Addresses = require('../model/address')
const Reviews = require('../model/reviews')
const Coupons = require('../model/coupon')


//ObjectID
const { ObjectId } = require('mongodb');


module.exports = {
    getUserHome: async (req, res) => {

        try {
            //Userid
            const userId = new ObjectId(req.session.userId)

            //fetching hoodies from database using lookup
            const hoodies = await Products.aggregate([
                {
                    $match: {
                        sub_category: 'Hoodie'
                    }
                },

                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'category'
                    }
                },

                {
                    $match: {
                        $or: [
                            { 'category.name': 'Mens' },
                            { 'category.name': 'Womens' }
                        ]
                    }
                },

            ])

            //Fetching 3 products to be desplayed on must have section 2 t-shirt and 1 hoodie
            //Fetch 1 T-shirt
            const tshirt = await Products.findOne({ sub_category: "T-Shirt" }).limit(1)

            //Fetch 1 hoodie
            const hoodie = await Products.findOne({ sub_category: 'Hoodie' }).limit(1)

            //Fetch 1 more T-shirt
            const secondTshirt = await Products.findOne({ sub_category: "T-Shirt" }).skip(1).limit(1)

            // Combine the results In the order of t-shirt - hoodie - t-shirt
            const mustHaveProducts = [tshirt, hoodie, secondTshirt];


            //Fetching first set of T-shirt for T-shirt section
            const firsttShirts = await Products.find({ sub_category: 'T-Shirt' }).skip(2).limit(4)

            //Fetching Hoodies for second hoodie section after skipping 1
            const firstHoodies = await Products.find({ sub_category: 'Hoodie' }).skip(1).limit(4)

            //Fetching second set of T-shirt
            const secondtShirts = await Products.find({ sub_category: 'T-Shirt' }).skip(6).limit(4)

            //Fetching Trending products using lookup
            const trendingProduct = await Products.aggregate([
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'category'
                    }
                },

                {
                    $match: {
                        'category.name': 'Trending'
                    }
                }
            ])
            //Bringing Banners 
            const banners = await Banners.find({})



            //Cart products Bringing
            const carts = await Cart.findOne({ userId })

            if (carts) {
                const productIds = carts.products.map(product => product.productId)//Extracting the product id in an array

                // Fetching products based on productIds
                const cartProducts = await Products.find({ _id: { $in: productIds } })

                // Creating a map to quickly look up products by their ID
                const productMap = new Map(cartProducts.map(product => [(product._id).toString(), product]))

                //Now populate the cart with product details
                var populatedCarts = [];
                carts.products.forEach(product => {
                    populatedCarts.push({
                        product: productMap.get((product.productId).toString()),
                        quantity: product.quantity
                    });

                });

                var totalPrice = 0;
                populatedCarts.forEach(cart => {

                    totalPrice += Number(cart.product.price) * Number(cart.quantity);
                })
            }



            //rendering user's home page along with banners and products to display
            res.render('user/html/index', { hoodies, banners, mustHaveProducts, firsttShirts, firstHoodies, secondtShirts, trendingProduct, carts: populatedCarts, totalPrice })
        } catch (error) {
            //If any error occurs on asyncronous operation collect it
            console.log(error)
            res.status(500).send({ message: 'Server Error', error })
        }
    },

    //User account page
    getUserAccountPage: async (req, res) => {

        //Userid
        const userId = new ObjectId(req.session.userId)

        const nav = req.query.nav

        const user = await Users.findOne({ _id: userId })

        res.render('user/html/account', { user, nav })
    },

    //User profile updation
    updateUserProfile: async (req, res) => {

        const userId = new ObjectId(req.session.userId)
        const { fname, lname, email, gender, number } = req.body

        const updateUser = await Users.updateOne(
            { _id: userId },
            {
                $set: {
                    firstName: fname,
                    lastName: lname,
                    email: email,
                    gender: gender,
                    number: number
                }
            },
            { new: true }
        )
        res.redirect('/user/account')
    },

    //Fuction to show product Details
    getProductDetails: async (req, res) => {

        //recieving productId from Params
        const productId = new ObjectId(req.params.productId)

        try {

            //Looking for product from database
            const product = await Products.findById(productId)

            //Fetching Products for Suggestion
            //fetching hoodies from database using lookup
            const hoodies = await Products.aggregate([
                {
                    $match: {
                        sub_category: 'Hoodie'
                    }
                },

                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'category'
                    }
                },

                {
                    $match: {
                        $or: [
                            { 'category.name': 'Mens' },
                            { 'category.name': 'Womens' }
                        ]
                    }
                },

            ])

            const reviews = await Reviews.findOne(
                { productId: product._id }).populate({
                    path: 'reviews.userId',
                    model: 'User'
                })

            console.log(reviews)
            //if product Exist render to product details page
            if (product) {
                res.render('user/html/product', { product, hoodies, reviews })
            }

        } catch (error) {
            // if any error occurs catch it
            console.log(error)
        }
    },

    // category displaying
    getCategory: async (req, res) => {

        try {

            //pagination

            const page = parseInt(req.query.page) || 1 // Current page number, default to 1
            const limit = 7// Products per page
            const skip = (page - 1) * limit // calculate skip value

            //extracting category from query 
            const category = req.query.category
            const sort = req.query.sort

            if (category === 'Mens') {

                const pipeline = [
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'categoryId',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },

                    {
                        $match: {
                            $or: [
                                { 'category.name': 'Mens' }
                            ]
                        }
                    },


                    {
                        $skip: skip // Skip documents based on the page number and limit
                    },

                    {
                        $limit: limit // Limit the number of documents returned per page
                    }
                ];
                //adding size vise filter
                if (req.query.sf) {
                    pipeline.splice(2, 0, { $match: { size: req.query.sf } })
                }
                //adding color filter
                if (req.query.cf) {
                    pipeline.splice(2, 0, { $match: { color: req.query.cf } })
                }

                // Adjust the pipeline based on the value of the 'sort' variable
                if (sort === 'LowHi') {
                    pipeline.splice(2, 0, { $sort: { price: 1 } }); // Insert $sort stage at index 2 for ascending price
                } else if (sort === 'HiLow') {
                    pipeline.splice(2, 0, { $sort: { price: -1 } }); // Insert $sort stage at index 2 for descending price
                }

                // Execute the aggregation pipeline
                var mensProducts = await Products.aggregate(pipeline);

            } else if (category === 'Womens') {


                const pipeline = [
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'categoryId',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },
                    {
                        $match: {
                            $or: [
                                { 'category.name': 'Womens' }
                            ]
                        }
                    },
                    {
                        $skip: skip // Skip documents based on the page number and limit
                    },
                    {
                        $limit: limit // Limit the number of documents returned per page
                    }
                ];
                //adding size vise filter
                if (req.query.sf) {
                    pipeline.splice(2, 0, { $match: { size: req.query.sf } })
                }

                if (req.query.cf) {
                    pipeline.splice(2, 0, { $match: { color: req.query.cf } })
                }

                // Adjust the pipeline based on the value of the 'sort' variable
                if (sort === 'LowHi') {
                    pipeline.splice(2, 0, { $sort: { price: 1 } }); // Insert $sort stage at index 2 for ascending price
                } else if (sort === 'HiLow') {
                    pipeline.splice(2, 0, { $sort: { price: -1 } }); // Insert $sort stage at index 2 for descending price
                }

                // Execute the aggregation pipeline
                var womensProducts = await Products.aggregate(pipeline);

            } else if (category === 'Hoodies') {

                const pipeline = [
                    {
                        $match: {
                            sub_category: 'Hoodie'
                        }
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit // Limit the number of documents returned per page
                    }

                ];
                //adding size vise filter
                if (req.query.sf) {
                    pipeline.splice(2, 0, { $match: { size: req.query.sf } })
                }
                if (req.query.cf) {
                    pipeline.splice(2, 0, { $match: { color: req.query.cf } })
                }
                // Adjust the pipeline based on the value of the 'sort' variable
                if (sort === 'LowHi') {
                    pipeline.splice(2, 0, { $sort: { price: 1 } }); // Insert $sort stage at index 2 for ascending price
                } else if (sort === 'HiLow') {
                    pipeline.splice(2, 0, { $sort: { price: -1 } }); // Insert $sort stage at index 2 for descending price
                }

                //Get hoodie products using lookup
                var hoodies = await Products.aggregate(pipeline)

            } else if (category === 'all products') {

                const pipeline = [
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit // Limit the number of documents returned per page
                    }

                ];
                //adding size vise filter
                if (req.query.sf) {
                    pipeline.splice(2, 0, { $match: { size: req.query.sf } })
                }
                if (req.query.cf) {
                    pipeline.splice(2, 0, { $match: { color: req.query.cf } })
                }
                // Adjust the pipeline based on the value of the 'sort' variable
                if (sort === 'LowHi') {
                    pipeline.splice(2, 0, { $sort: { price: 1 } }); // Insert $sort stage at index 2 for ascending price
                } else if (sort === 'HiLow') {
                    pipeline.splice(2, 0, { $sort: { price: -1 } }); // Insert $sort stage at index 2 for descending price
                }

                //Get hoodie products using lookup
                var hoodies = await Products.aggregate(pipeline)
            }
            //Banner 
            const banners = await Banners.find({ charecterist: 'Category' })

            //Render mens category page along with products
            res.render('user/html/category', { products: mensProducts || womensProducts || hoodies, banners, page, category, sort, cf: req.query.cf || '', sf: req.query.sf || '' });

        }
        catch (error) {
            //console if any error happens
            console.log(error)
        }

    },



    //checkout Page Rendering
    checkoutPage: async (req, res) => {

        const userId = new ObjectId(req.session.userId)

        const user = await Users.findById(userId);

        //Addrss find for user
        const addressExist = await Addresses.findOne({ userId })

        //if there is no req.query of productId then it means checkout page should render along with cart details
        if (!req.query.productId) {

            //Cart products Bringing
            const carts = await Cart.findOne({ userId })

            if (carts) {
                const productIds = carts.products.map(product => product.productId)//Extracting the product id in an array

                // Fetching products based on productIds
                const cartProducts = await Products.find({ _id: { $in: productIds } })

                // Creating a map to quickly look up products by their ID
                const productMap = new Map(cartProducts.map(product => [(product._id).toString(), product]))

                //Now populate the cart with product details
                var populatedCarts = [];
                carts.products.forEach(product => {
                    populatedCarts.push({
                        product: productMap.get((product.productId).toString()),
                        quantity: product.quantity
                    });

                });

                var totalPrice = 0;
                populatedCarts.forEach(cart => {

                    totalPrice += Number(cart.product.price) * Number(cart.quantity);
                })
                var coupon = await Coupons.findOne({ minOrderAmount: { $lte: totalPrice } })
                console.log(coupon)
            }
        } else {// if req.query of productId then it means user clicked on buy now option from product details so the page render along with a single product
            const productId = new ObjectId(req.query.productId)

            var product = await Products.find({ _id: productId })

            totalPrice = product[0].price
        }

        //rendering user's home page along with banners and products to display
        res.render('user/html/checkout', {
            carts: populatedCarts || product,
            totalPrice: totalPrice || 0,
            user,
            address: addressExist?.addresses,
            coupon
        })
    },


    //search
    searchProducts: async (req, res) => {
        const value = req.body.search

        try {

            const products = await Products.find({ $text: { $search: value } })// Perform text search

            const banners = await Banners.find({ charecterist: 'Category' })


            res.render('user/html/category', { products, banners, page: 1, category: '', sort: '' })
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    //Logout function
    logOut: (req, res) => {
        //Destroying the current Session
        req.session.destroy()

        //Redirect to login page
        return res.redirect('/')
    }
}

