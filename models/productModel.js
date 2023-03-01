const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '產品必須要有名稱'],
        unique: true,
        trim: true,
    },
    chineseName: {
        type: String,
        required: [true, '產品必須要有名稱'],
        unique: true,
        trim: true,
    },
    slug: String,
    price: {
        type: Number,
        required: true
    },
    summary: {
        type: String,
        trim: true,
        required: [true, '產品必須要有總結']
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, '產品必須要有照片']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    type: {
        type: String,
        required: [true, '一個產品要有分類欄位'],
        enum: {
            values: ['dried', 'fresh', 'orchid'],
            message: '一個產品必須被分類為乾燥花、鮮花、蘭花、植物'
        }
    },
    new: {
        type: Boolean,
        default: true
    }

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

productSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { upper: true });
    next();
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;