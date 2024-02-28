const mongoose = require('mongoose')

const order = {
  orderId: String,
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'addresses',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products'
  },
  quantity: Number,
  location: String,
  status: { type: String, default: 'created' }, // created, paid, shipped, delivered
  operator: String,
  location: String,
  start_date: {
    type: String,
  },
  estDeliverydue: String,
  cancelledDate: String

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