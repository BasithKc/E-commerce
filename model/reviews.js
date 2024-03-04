const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    ref: 'products'
  },
  reviews: [{
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    review: String,
    rating: Number,
    time: {
      type: String,

    }
  }]
})

module.exports = mongoose.model('reviews', reviewSchema)