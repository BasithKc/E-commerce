const mongoose = require('mongoose')

const order = {
  orderId: String,
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],

  status: { type: String, default: 'created' }, // created, paid, shipped, delivered
  operator: String,
  location: String,
  start_date: {
    type: String,
  },
  estDeliverydue: String

}

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orders: [order],
})

module.exports = mongoose.model('orders', orderSchema)