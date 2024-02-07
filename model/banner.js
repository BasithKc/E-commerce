const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
  bannerHead:String,
  charecterist:String,
  description:String,
  expire_date:String,
  image:String
})

module.exports = mongoose.model("banners", bannerSchema);