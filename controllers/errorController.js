const AppError = require('../utils/appError');

const handleDuplicateFieldsDB = err => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];

    const message = `重複欄位值: ${value}. 請使用另外一個值!`;
    return new AppError(message, 400);
};

const sendError = (error, req, res) => {
    console.log(error);

    res
        .status(error.statusCode)
        .json({ status: error.status, message: error.message })
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        let error = { ...err };
        error.message = err.message;

        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        sendError(error, req, res);
    }
}