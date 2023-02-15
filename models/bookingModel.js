const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, '訂單一定會有產品ID']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "訂單一定會有使用者ID"]
    },
    price: {
        type: Number,
        require: [true, '訂單一定會有產品的價格']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;