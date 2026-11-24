const express = require('express');
const authController = require('../controllers/authController.js');
const {protect} = require('../middleware/authMiddleware.js')

const router = express.Router();

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', authController.Login);
router.get('/profile',protect, authController.getProfile )

module.exports = router;
