const mongoose = require('mongoose');

//Wishlist product schema
const wishlistProducts = {
  type: mongoose.Types.ObjectId,
  ref: 'products',
  require: true,
};

//Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  //Userid for each wishlist
  userId: {
    type: mongoose.Types.ObjectId,
    require: true,
  },
  //products id in an array
  products: [wishlistProducts],
});

//Creating model of wishlist
module.exports = new mongoose.model('wishtlist', wishlistSchema);
