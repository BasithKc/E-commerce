const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Types.ObjectId
  },
  reviews: [String]
})