
//Importing models

const Wishlist = require('../model/wishlist')

//ObjectID
const { ObjectId } = require('mongodb');


module.exports = {
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

      let wishlist = await Wishlist.findOne({ userId })
      if (!wishlist) {
        wishlist = new Wishlist({
          userId,
          products: []
        })
        await wishlist.save()
      }
      // Return the wishlist array from the user document
      res.status(200).json({ wishlist: wishlist.products });

    } catch (error) {
      console.log(error)
    }

  },
}