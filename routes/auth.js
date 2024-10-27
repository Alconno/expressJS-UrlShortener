const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/AuthMiddleware.js');
const authController = require('../controllers/AuthController.js');
const { validateAuthRequest } = require('../Validations/AuthValidation.js');

router.post('/register', validateAuthRequest('register'), authController.register);
router.post('/login', validateAuthRequest('login'), authController.login);
router.post('/logout', verifyToken, authController.logout);
router.get('/verify-email/:token', validateAuthRequest('verifyEmail'), authController.verifyEmail);
router.get('/resend-verify-token', validateAuthRequest('resendToken'), authController.resendVerifyToken);

module.exports = router;
