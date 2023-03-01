const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
// const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/product/:name', authController.isLoggedIn, viewController.getProduct);
router.get('/story', viewController.getStory);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewController.getSignForm)
router.get('/forgotpassword', viewController.getForgot);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/dried', authController.isLoggedIn, viewController.getDried);
router.get('/fresh', authController.isLoggedIn, viewController.getFresh);
router.get('/orchid', authController.isLoggedIn, viewController.getOrchid);
router.get('/reset/:token', viewController.resetPassword);

module.exports = router;
