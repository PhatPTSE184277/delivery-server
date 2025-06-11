const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const { VerifyToken } = require('../middlewares/verifyToken');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/verify-otp', controller.verifyOTP);
router.post('/resend-otp', controller.resendOTP);
router.get('/validate-token', VerifyToken, controller.validateToken);

module.exports = router;