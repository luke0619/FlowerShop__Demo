const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '使用者必須要有名字'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, '請提供你的信箱'],
        unique: true,
        validate: [validator.isEmail, '請提供合法的信箱']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, '請提供密碼'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, '請提供使用者密碼'],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: '第二組密碼與第一組密碼不一致'
        }
    },
    address: {
        type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// 將密碼儲存進資料庫之前雜湊密碼 
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // ???

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    // 紀錄密碼更改時的時間
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    // 查詢指令只查出有啟動的帳號的紀錄,不會顯示未啟動的帳號.
    this.find({ active: { $ne: false } });
    next();
});

// 檢查輸入的密碼(第一個引數)與資料庫中加密密碼(第二個引數)是否一致的函式
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    // 發送憑證後 使用者若更改密碼 則扔出錯誤 表示憑證已經無法再次使用
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changedTimestamp; // 100 < 200
    }

    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex'); // 產生一個隨機憑證

    // 將憑證進行加密
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //密碼重置時間: 十分鐘
    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;