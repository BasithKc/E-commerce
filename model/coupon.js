const mongoose = require('mongoose')

//coupon schema
const couponSchema = new mongoose.Schema({
  coupon_code: {
    type: String,
    require: true,
    unique: true,
    uppercase: true
  },

  minOrderAmount: {
    type: Number,
    require: true,
    default: true
  },

  discount: {
    type: Number,
    required: true
  },

  start_date: {
    type: String, require: true,
  },

  expire_date: {
    type: String,
    require: true,
  }
})


var Coupons = mongoose.model('coupons', couponSchema);
module.exports = Coupons;