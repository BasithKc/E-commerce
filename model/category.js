const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:String,
    sub_category:[String],
    description:{type: String, required: true},
})
//categorySchema.virtual("url").get(function(){
    //return `/products/${this._id}`;
//});

module.exports = mongoose.model("categories", categorySchema);