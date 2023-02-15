const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const bookingRouter = require('./routes/bookingRoute');


const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 樣板引擎:pug MVC中的View指定在views這個資料夾
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 提供靜態檔案
app.use(express.static(path.join(__dirname, 'public')));

// 設定 安全的Http標頭
app.use(helmet());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parser,從body讀取數據進req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 數據清洗 防止SQL注入攻擊
app.use(mongoSanitize());

// Data sanitization againse XSS
app.use(xss());

// 預防參數汙染

// 測試中介軟體
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;