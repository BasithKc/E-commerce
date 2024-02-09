const Products = require('../model/product')
const Categories = require('../model/category')
const Banners = require('../model/banner')

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
            console.log(trendingProduct)
            //Bringing Banners 
            const banners = await Banners.find({})

            //rendering user's home page along with banners and products to display
            res.render('user/html/index', { hoodies, banners, mustHaveProducts, firsttShirts, firstHoodies, secondtShirts, trendingProduct })
        } catch (error) {
            //If any error occurs on asyncronous operation collect it

            res.status(500).send({ message: 'Server Error', errror })
        }
    }
}