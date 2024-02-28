const mongoose = require('mongoose')

const address = {
  name: String,
  number: Number,
  address: String,
  post: String,
  country: String,
  state: String,
  zip_code: String,
  addressType: String
}

const addressSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  addresses: [address]
})

module.exports = mongoose.model('addresses', addressSchema)