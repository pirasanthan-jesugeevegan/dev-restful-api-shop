const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true }, //Validation - Defining Type and Required
    price: { type: Number, required: true }, //Validation - Defining Type and Required
    productImage: { type: String, }
});

module.exports = mongoose.model('Product', productSchema);