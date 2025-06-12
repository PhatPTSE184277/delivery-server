const router = require('express').Router();
const controller = require('../controllers/user.controller');
const { VerifyToken } = require('../middlewares/verifyToken');

router.get('/profile', VerifyToken, controller.getUser);
router.get('/lookup/:username', controller.getUserByUsername); // SỬA: Không cần token cho lookup

module.exports = router;