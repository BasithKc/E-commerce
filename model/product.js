const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: String,
    description: { type: String, required: true },
    specifications: [String],
    price: Number,
    image: [String],
    categoryId: { type: mongoose.Types.ObjectId },
    sub_category: String,
    stock: Number,
    expire_date: String,
    size: String,
    color: String,
    star: Number, // 1-5
})
productSchema.methods.isInStock = function () {
    return this.stock > 0;
}

// Create a text index on name, category, and description fields
productSchema.index({ name: "text", sub_category: "text", description: "text" });

//productSchema.loadClass(Product)
module.exports = mongoose.model("products", productSchema);