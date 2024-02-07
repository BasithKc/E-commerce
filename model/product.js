const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:String,
    description:{type: String, required: true},
    specifications:[String],
    price:String,
    image:[String],
    categoryId:{type : mongoose.Types.ObjectId},
    sub_category:String,
    stock:Number,
    expire_date:String
})
productSchema.methods.isInStock=function(){
    return this.stock > 0;
}
//productSchema.loadClass(Product)
module.exports = mongoose.model("products", productSchema);