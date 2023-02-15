const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
        return next(new AppError('沒有找到此ID的文件', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
});
exports.getAll = Model => catchAsync(async (req, res, next) => {
    const docs = await Model.find();
    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: {
            data: docs
        }
    })
});
exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    })
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!doc) next(new AppError('更新此ID文件失敗', 404));

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('無法找到該ID的文件', 404));
    }

    res.status(204).json({
        status: 'success',
        message: '成功刪除紀錄'
    });
});