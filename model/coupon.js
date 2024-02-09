const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  code: { type: String, require: true, unique: true, uppercase:true },
  isPercent: { type: Boolean, require: true, default: true },
  amount: { type:[Number] , required: true } ,
  expireDate: { type: String, require: true, default: '' },
  isActive: { type: Boolean, require: true, default: true }
})

couponSchema.pre('save', function (next){
  const currentDate = new Date()
  this.updated_at = currentDate
  if (!this.created_at) {
    this.created_at = currentDate;
    }
    next()
})
var Coupons = mongoose.model('coupons', couponSchema);
module.exports = Coupons;