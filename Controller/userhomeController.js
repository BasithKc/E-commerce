
//Importing models
const Products = require('../model/product')
const Categories = require('../model/category')
const Banners = require('../model/banner')
const Wishlist = require('../model/wishlist')

//ObjectID
const { ObjectId } = require('mongodb');


module.exports = {
    getUserHome: async (req, res) => {

        try {
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

            //rendering user's home page along with banners and products to display
            res.render('user/html/index', { hoodies, banners, mustHaveProducts, firsttShirts, firstHoodies, secondtShirts, trendingProduct })
        } catch (error) {
            //If any error occurs on asyncronous operation collect it

            res.status(500).send({ message: 'Server Error', errror })
        }
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

    //Men's category displaying
    getMensCategory: async (req, res) => {

        try {
            //Get mens products using lookup
            const mensProduct = await Products.aggregate([

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

            ])
            //Render mens category page along with products
            res.render('user/html/category', { mensProduct })

        } catch (error) {
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
            const userId = req.session.userId

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

    //Logout function
    logOut: (req, res) => {
        //Destroying the current Session
        req.session.destroy()

        //Redirect to login page
        return res.redirect('/')
    }
}