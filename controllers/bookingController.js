const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/productModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 取得現在被購買的產品的資料
    const product = await Product.findById(req.params.productId);

    // 設置表單設定
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        //導回首頁 但後面帶著三個路徑參數
        // ?product=${req.params.productId}&user=${req.user.id}&price=${product.price}
        success_url: `${req.protocol}://${req.get('host')}`,
        cancel_url: `${req.protocol}://${req.get('host')}/product/${product.name}`,
        customer_email: req.user.email,
        client_reference_id: req.params.productId,
        mode: 'payment',
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'twd',
                    unit_amount: product.price * 100,
                    product_data: {
                        name: `${product.name} 植物盆栽`,
                        description: product.summary,
                    }
                }
            }
        ]
    });

    // 以session作為回應
    res.status(200).json({
        status: 'success',
        session
    })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // const { product, user, price } = req.query;

    //沒有參數的話就略過 執行下一個middleware
    // if (!product && !user && !price) return next();

    //請求帶有路徑參數的話則在Booking底下創造訂單紀錄
    // await Booking.create({ product, user, price });

    //導回首頁
    res.redirect(req.originalUrl[0]);
})


exports.getAllbookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);