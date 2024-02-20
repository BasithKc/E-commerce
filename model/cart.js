const mongoose = require('mongoose');

// Define a subdocument schema for the products in the cart
const cartProducts = {
  productId: {
    type: mongoose.Types.ObjectId,
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    default: 1 // You can set a default value if needed
  }

};

//Cart Schema
const cartSchema = new mongoose.Schema({

  //Userid for each cart
  userId: {
    type: mongoose.Types.ObjectId,
    require: true,
    ref: 'products'
  },

  //products id in an array
  products: [cartProducts],

});

//Creating model of wishlist
module.exports = new mongoose.model('cart', cartSchema);