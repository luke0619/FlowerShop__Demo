const { promisify } = require('util');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const User = require('../models/userModel');


/*eslint-disable*/
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

const createSendToken = (user, statusCode, req, res) => {
    //產生憑證
    const token = signToken(user._id);

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    // cookie 設置選項 存活時間:30天 瀏覽器限制cookie只能經由HTTP(S)來存取
    // 在cookie中設定key為jwt 值為token變數的 keypair 設定為cookie持續30天
    res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    });


    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    // 將使用者的資料新增到資料庫當中
    const newUser = await User.create(req.body);

    // 根據使用者的ID產生憑證並且在使用者的瀏覽器產生一個Cookie 回傳憑證以及使用者資料
    createSendToken(newUser, 201, req, res)
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) 檢查信箱跟密碼是否存在
    if (!email || !password) {
        return next(new AppError('您輸入的信箱或密碼並不正確', 400));
    }

    // 2) 檢查使用者是否存在跟密碼是否正確
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('不正確的信箱或密碼', 401));
    }

    // 3) 如果以上檢查正確 則將token寄送到客戶端
    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.clearCookie('jwt');

    res.status(200).json({
        status: 'success',
    })
};

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
        token = req.cookies.jwt;
    }

    if (!token) {
        // return next(
        //     new AppError('You are not logged in! Please log in to get access.', 401)
        // );

        res.redirect(req.originalUrl);
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password! Please log in again.', 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('你並無權限執行這個動作', 403));
        }

        next();
    }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) 先將使用者傳過來的信箱與資料庫中進行比對 查找是否存在該使用者
    const user = await User.findOne({ email: req.body.email });
    // 若無 則扔出錯誤
    if (!user) {
        return next(new AppError('查無該信箱的使用者', 404));
    }

    // 2) 產生隨機重設密碼用的token 在該Doc的欄位中
    const resetToken = user.createPasswordResetToken();
    // 取消檢查 (??)
    await user.save({ validateBeforeSave: false });

    // 3) 寄送resetToken 到 使用者的信箱
    try {
        const resetURL = `${req.protocol}:://${req.get('host')}/reset/${resetToken}`
        const token = resetToken;
        await new Email(user, resetURL, token).sendPasswordReset();

        res.status(200).json({
            status: "success",
            message: '憑證已寄送到信箱中!'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('寄送到信箱的程序出了錯誤. 請稍後重試', 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 根據forgotPassword 給予的token進行驗證 如果hashedToken與req.params.token中的一樣則將密碼進行更換
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 若找不到使用者 扔出錯誤
    if (!user) {
        return next(new AppError('憑證是不合法的或是已經到期', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('您現在的密碼不正確', 401))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, req, res);
})