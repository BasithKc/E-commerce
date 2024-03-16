//Importing models
const Products = require('../model/product')
const Cart = require('../model/cart')

//ObjectID
const { ObjectId } = require('mongodb');



module.exports = {
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
      res.render('user/html/cart', { carts: populatedCarts, totalPrice: totalPrice || 0 })
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

      //Checking if user already has a cart with products
      let userCart = await Cart.findOne({ userId });

      if (!userCart) {
        userCart = new Cart({
          userId,
          products: []
        })
        await userCart.save();
      }

      // Find if the product already exists in the cart
      const existingProductIndex = userCart.products.findIndex(product => product.productId.equals(productId));

      if (existingProductIndex !== -1) {
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
        console.log(userCartProduct)
      }
      return res.status(200).json({ success: true })    //return success

    } catch (error) {

      //Catching if any erro occurs
      console.log(error)
      res.status(500).json({ success: false })
    }
  },

}