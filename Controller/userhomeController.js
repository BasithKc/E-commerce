//Third party modules
const Razorpay = require('razorpay')

//Importing models
const Products = require('../model/product')
const Categories = require('../model/category')
const Banners = require('../model/banner')
const Wishlist = require('../model/wishlist')
const Cart = require('../model/cart')
const Users = require('../model/users')
const Addresses = require('../model/address')
const Orders = require('../model/order')

//ObjectID
const { ObjectId } = require('mongodb');

//Middlewares
const dateConvert = require('../middlewares/dateConvert')

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
})

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

    //address listing page
    getUserAddress: async (req, res) => {

        //nav
        const nav = req.query.nav
        //UserId
        const userId = new ObjectId(req.session.userId)

        //User
        const user = await Users.findById(userId)

        //Addressess fetching
        const address = await Addresses.findOne({ userId })

        res.render('user/html/account-addres', { address: address?.addresses, nav, user })
    },

    //Address adding
    addAddressPost: async (req, res) => {
        //Userid
        const userId = new ObjectId(req.session.userId)
        //req.body
        const { name, number, zip_code, post, address, country, state, addressType } = req.body
        console.log(req.body)
        const addresstoAdd = {
            name,
            number,
            address,
            country,
            state,
            post,
            zip_code,
            addressType
        }

        //checking if already any address is creted for this user
        let addressExist = await Addresses.findOne({ userId })

        if (!addressExist) {

            //new instance creation for address
            addressExist = new Addresses({
                userId,
                addresses: [addresstoAdd]
            })
            await addressExist.save()
        }
        else {
            await Addresses.findOneAndUpdate(
                { userId },
                { $push: { addresses: addresstoAdd } },
                { new: true }
            )
        }

        res.redirect('/user/account/address?nav=Manage Addresses');
    },

    //Address deleting
    deleteAddress: async (req, res) => {

        const userId = new ObjectId(req.session.userId)

        //addressid from req.params
        const addressId = req.params.addressId

        try {
            //Find by userid and delete the selected address  from array of addresses
            await Addresses.findOneAndDelete(
                { userId },
                { addresses: { $pull: { _id: addressId } } },
                { new: true }
            )
            res.redirect('/user/account/address?nav=Manage Addresses')

        } catch (error) {
            console.log(error)
        }


    },

    //Order listing 
    getOrdersList: async (req, res) => {

        try {
            //userId
            const userId = new ObjectId(req.session.userId)

            // Find the user document by userId
            const orders = await Orders.findOne({ userId }).populate({
                path: 'orders',
                populate: {
                    path: 'product',
                    model: 'products'
                }
            })

            res.render('user/html/orders', { orders: orders.orders })
        } catch (error) {
            console.log(error)
        }


    },

    //function to show details of product
    OrderDetailsPage: async (req, res) => {
        const userId = new ObjectId(req.session.userId)
        //Order id from params
        const orderId = req.params.orderId;

        const orders = await Orders.aggregate([
            { $match: { userId } },
            { $match: { "orders.orderId": orderId } }
        ]);


        const productId = new ObjectId(req.query.product) //productId from query


        let orderPro;

        orders[0].orders.map(order => {
            // Find the product within the order's products array
            if (order.product.toString() === productId.toString()) {
                orderPro = order

            }

        });

        const address = await Addresses.findOne({ userId, addresses: { $elemMatch: { _id: orderPro.addressId } } });
        //fetching address

        const productDetails = await Products.findOne({ _id: orderPro.product })


        res.render('user/html/order-details', {
            product: productDetails,
            address,
            orderPro,
        })
    },

    orderCancel: async (req, res) => {
        const userId = new ObjectId(req.session.userId)

        const orderId = req.params.orderId //orderId
        const productId = new ObjectId(req.query.product)//product id
        console.log(productId)

        // Find the orders that match the specified userId and orderId
        const orders = await Orders.findOne({ userId, "orders.orderId": orderId });

        const currentDate = new Date()

        const estimatedDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        const cancellDate = dateConvert(estimatedDate)//End date
        // Update the status of the specific order
        orders.orders.forEach(order => {
            if (order.product.toString() === productId.toString()) {
                order.status = 'Cancelled';
                order.cancelledDate = cancellDate
            }
        });
        await orders.save()

        res.redirect('/user/account/orders/order-details/' + orderId + '?product=' + productId.toString());
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

            //if product Exist render to product details page
            if (product) {
                res.render('user/html/product', { product, hoodies })
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

                // Adjust the pipeline based on the value of the 'sort' variable
                if (sort === 'LowHi') {
                    pipeline.splice(2, 0, { $sort: { price: 1 } }); // Insert $sort stage at index 2 for ascending price
                } else if (sort === 'HiLow') {
                    pipeline.splice(2, 0, { $sort: { price: -1 } }); // Insert $sort stage at index 2 for descending price
                }

                // Execute the aggregation pipeline
                var mensProducts = await Products.aggregate(pipeline);

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
            res.render('user/html/category', { products: mensProducts || womensProducts || hoodies, banners, page, category });

        }
        catch (error) {
            //console if any error happens
            console.log(error)
        }

    },


    //Render Wishlist page along with favorite products
    getWishlistPage: async (req, res) => {
        try {

            //userid
            const userId = new ObjectId(req.session.userId)

            //Fetching favorite products from db
            // Fetch the wishlist document based on the user ID
            const wishlistProduct = await Wishlist.findOne({ userId }).populate('products');
            if (wishlistProduct) {
                res.render('user/html/wishlist', { products: wishlistProduct.products })
            }

        } catch (error) {
            console.log(error)
        }

    },

    //Function to add to wishlist
    addToWishList: async (req, res) => {

        //Getting userid from session.userId
        let userId = req.session.userId

        if (!userId) {
            return res.json({ success: false })
        }
        userId = new ObjectId(req.session.userId)
        //Getting productId from req.body
        const productId = new ObjectId(req.body.productId)

        console.log('productid', productId)
        try {

            //Checking if user already has a wishlist with products
            let userWishlist = await Wishlist.findOne({ userId });

            // If the user doesn't have a wishlist, create a new one
            if (!userWishlist) {
                userWishlist = new Wishlist({ userId, products: [] });
                await userWishlist.save();
            }

            //Checking if the product is already in the user's Wishlist
            // Use aggregation to find the index of the product
            const aggregationResult = await Wishlist.aggregate([
                {
                    $match: { userId: userId }
                },
                {
                    $project: {
                        index: {
                            $indexOfArray: ["$products", productId]
                        }
                    }
                }
            ]);
            // Extract the index from the aggregation result
            const productIndex = aggregationResult.length > 0 ? aggregationResult[0].index : -1;

            console.log('Product Index:', productIndex);

            if (productIndex === -1) {
                // Product does not exist in the wishlist, add it
                await Wishlist.findOneAndUpdate(
                    { userId: userId },
                    { $push: { products: productId } },
                    { new: true }
                );
                console.log('Product added to wishlist');
                return res.json({ success: true })
            } else {
                console.log('Product already exists in the wishlist');
                res.json({ success: true })
            }
            //redirecting to the same page

        } catch (error) {

            //Catching if any erro occurs
            console.log(error)
            res.json({ success: false })
        }


    },

    //function remove from wishlist
    removeFromWishList: async (req, res) => {

        //PRoduct id
        const productId = req.params.productId
        //User Id
        const userId = req.session.userId

        try {

            //Use userId to match the wishlist belonging to the specific user and find that document 
            const wishlist = await Wishlist.findOneAndUpdate(
                { userId },
                { $pull: { products: productId } },
                { new: true }
            )
            //If userid not working
            if (!wishlist) {
                return res.status(404).json({ message: 'Wishlist not found for the user' });
            }

            //I have request coming both from frontend and backend , so i have to handle both like this
            if (req.query.source === 'axios') {
                //return json object
                res.status(200).json({ message: 'Product removed from wishlist successfully' });
            } else {
                //redirect to wishlist page again if the request is coming from backend
                res.redirect('/user/wishlist')

            }
        } catch (error) {
            //Catch the error
            console.log(error)
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    //Fetch wishlist on page loading
    fetchWishlist: async (req, res) => {
        try {

            //UserId
            const userId = new ObjectId(req.session.userId)

            const wishlist = await Wishlist.findOne({ userId })
            if (!wishlist) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Return the wishlist array from the user document
            res.status(200).json({ wishlist: wishlist.products });

        } catch (error) {
            console.log(error)
        }

    },

    //getCart page
    getCartPage: async (req, res) => {
        const userId = new ObjectId(req.session.userId)
        try {
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
            res.render('user/html/cart', { carts: populatedCarts, totalPrice })
        } catch (error) {
            console.log(error)
        }
    },

    removeFromCart: async (req, res) => {
        //PRoduct id from params
        const productId = new ObjectId(req.params.productId)

        const userId = new ObjectId(req.session.userId);

        const deleteFromCart = await Cart.findOneAndUpdate(
            { userId },
            { $pull: { products: { productId: productId } } },
            { new: true }
        )
        res.redirect('/user/cart-page')

    },
    //Fetch cart on page loading
    fetchCart: async (req, res) => {
        try {

            //UserId
            const userId = new ObjectId(req.session.userId)

            let userCart = await Cart.findOne({ userId })

            if (!userCart) {
                userCart = new Cart(
                    {
                        userId,
                        products: []
                    });
                await userCart.save()
            }
            // Return the wishlist array from the user document
            res.status(200).json({ cart: userCart.products });

        } catch (error) {
            console.log(error)
            return res.status(404).json({ message: 'User not found' });
        }

    },

    //Function to add to cart
    addtoCart: async (req, res) => {
        try {

            //Getting userid from session.userId
            let userId = req.session.userId

            //quantity
            const quantity = parseInt(req.query.quantity) || 1;

            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID not found" });
            }

            //Getting productId from req.body
            const productId = new ObjectId(req.params.productId)

            // Find the product details
            const productDetails = await Products.findById(productId);


            //Checking if user already has a cart with products
            let userCart = await Cart.findOne({ userId });

            // Find if the product already exists in the cart
            const existingProductIndex = userCart.products.findIndex(product => product.productId.equals(productId));

            if (existingProductIndex !== -1) {
                console.log(userCart)
                // If the product exists, update its quantity 
                userCart.products[existingProductIndex].quantity = quantity;

                await userCart.save();

            } else {

                //If the product does not exist, push the product and quantity to the products array of cart
                const userCartProduct = await Cart.findOneAndUpdate(
                    { userId },
                    {
                        $push: {
                            products: {
                                productId,
                                quantity
                            }
                        },
                    },
                    { new: true }

                )
            }
            return res.status(200).json({ success: true })    //return success

        } catch (error) {

            //Catching if any erro occurs
            console.log(error)
            res.status(500).json({ success: false })
        }
    },

    //checkout Page Rendering
    checkoutPage: async (req, res) => {

        const userId = new ObjectId(req.session.userId)

        const user = await Users.findById(userId);

        //Addrss find for user
        const addressExist = await Addresses.findOne({ userId })

        if (!req.params.productId) {

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
        } else {
            const productId = new ObjectId(req.params.productId)

            var product = await Products.find({ _id: productId })
            console.log(product)

            totalPrice = product[0].price
        }




        //rendering user's home page along with banners and products to display
        res.render('user/html/checkout', {
            carts: populatedCarts || product,
            totalPrice,
            user,
            address: addressExist?.addresses
        })
    },

    //create Order 
    createOrder: async (req, res) => {

        try {
            //Session userId
            const userId = new ObjectId(req.session.userId)
            const user = await Users.findOne({ _id: userId })


            const { address, country, state, zipCode, totalPrice, post, addressType } = req.body //req.body of axios

            const options = {
                amount: totalPrice * 100,
                currency: 'INR',
            }

            const addresstoAdd = {
                address,
                country,
                state,
                post,
                zip_code: zipCode,
                addressType
            }

            //checking if already any address is creted for this user
            let addressExist = await Addresses.findOne({ userId })

            if (!addressExist) {

                //new instance creation for address
                addressExist = new Addresses({
                    userId,
                    addresses: [addresstoAdd]
                })
                await addressExist.save()
            }


            const order = await razorpay.orders.create(options)
            res.json({ order, key_id: process.env.RAZORPAY_ID_KEY, user, address: addressExist, totalPrice })

        } catch (error) {
            console.log(error)
        }

    },

    //complete order
    completeOrder: async (req, res) => {

        const { responseData, products } = req.body
        //Order Id
        const orderId = responseData.order.id

        //Admin for Operator
        const admin = await Users.findOne({ role: 'admin' })

        //delivery location
        const address = responseData.address.addresses[0]
        //User Id
        const userId = new ObjectId(req.session.userId)

        //date
        const currentDate = new Date()

        const startDate = dateConvert(currentDate) //Start Date

        const estimatedDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        const dueDate = dateConvert(estimatedDate)//End date

        try {

            //Find if user already have a orders
            let orderExist = await Orders.findOne({ userId })

            //User doesn't have already an order
            if (!orderExist) {

                orderExist = new Orders({
                    userId,
                    orders: []
                })

                products.forEach(async (product) => {
                    orderExist.orders.push({

                        orderId,
                        addressId: address._id,
                        product: product.productId,
                        quantity: product.quantity,
                        location: `${address.post}, ${address.state}`,
                        operator: admin.firstName + ' ' + admin.lastName,
                        location: address.post,
                        start_date: startDate,
                        estDeliverydue: dueDate

                    })
                })
                await orderExist.save()

            } else {
                //If order exist push the order details to orders
                products.forEach(async (product) => {
                    orderExist.orders.push({

                        orderId,
                        addressId: address._id,
                        product: product.productId,
                        quantity: product.quantity,
                        location: `${address.post, address.state}`,
                        operator: admin.firstName + ' ' + admin.lastName,
                        location: address.post,
                        start_date: startDate,
                        estDeliverydue: dueDate

                    })
                })
                await orderExist.save()
            }


            //Delete the products from cart
            const productIds = products.map(product => product.productId);

            await Cart.findOneAndUpdate(
                { userId: userId },
                {
                    $pull: {
                        products: { productId: { $in: productIds } }
                    }
                }
            )

            res.status(200).json({ success: true })

        } catch (error) {

            console.log(error)//catching the error
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

