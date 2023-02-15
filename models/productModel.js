const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '產品必須要有名稱'],
        unique: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;