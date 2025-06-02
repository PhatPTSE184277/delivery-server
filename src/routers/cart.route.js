const router = require('express').Router();
const controller = require('../controllers/cart.controller');

router.get('/', controller.getCartItems);
router.post('/:foodId', controller.addToCart);
router.delete('/:foodId', controller.removeFromCart);

module.exports = router;