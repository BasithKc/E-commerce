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
  paymentMethod: String,
  start_date: {
    type: String,
  },
  estDeliverydue: String,
  cancelledDate: String,
  shippedDate: String,
  onTheWayDate: String,
  deliveredDate: String

}

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orders: [order],
})

orderSchema.index({ "orders.orderId": "text" });

module.exports = mongoose.model('orders', orderSchema)