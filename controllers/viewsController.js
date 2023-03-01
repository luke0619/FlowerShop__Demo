const Product = require('../models/productModel');
const AppError = require('../utils/appError');
// const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
    const products = await Product.find({ new: true });

    res
        .status(200)
        .set(
            'Content-Security-Policy',
            "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;"
        )
        .render('overview', {
            products
        });
});

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findOne({ name: req.params.name });

    if (!product) {
        return next(new AppError('無法找到該名稱的產品', 404));
    }

    res
        .status(200)
        .set(
            'Content-Security-Policy',
            "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
        )
        .render('product', {
            product
        });
});

exports.getLoginForm = (req, res) => {
    res.status(200)
        .render('login', {
            title: '登入您的帳號',
        });
}

exports.getSignForm = (req, res) => {
    res.status(200).render('signup', {
        title: '註冊使用者'
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: '您的帳戶'
    })
}

exports.getDried = catchAsync(async (req, res) => {
    const products = await Product.find({ type: 'dried' });

    res.status(200).render('dried', {
        products
    })
});

exports.getFresh = catchAsync(async (req, res) => {
    const products = await Product.find({ type: 'fresh' });

    res.status(200).render('fresh', {
        products
    })
});

exports.getOrchid = catchAsync(async (req, res) => {
    const products = await Product.find({ type: 'orchid' });

    res.status(200).render('orchid', {
        products
    })
});

exports.getForgot = catchAsync(async (req, res) => {
    res.status(200).render('forgot', {
        title: '忘記密碼'
    })
})

exports.resetPassword = catchAsync(async (req, res) => {
    res.status(200).render('reset', {
        title: '重設密碼',
        token: req.params.token
    })
})

exports.getStory = catchAsync(async (req, res) => {
    res.status(200).render('story', {
        title: '品牌故事',
    })
})