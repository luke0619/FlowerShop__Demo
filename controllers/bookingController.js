// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/productModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Product.findById(req.params.productId);

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?products=${req.params.productId}&user=${req.user.id}&price=${Product.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/products/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.productId,
        mode: 'payment',
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                    },
                },
            },
        ],
    });

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    })
});



exports.getAllbookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);