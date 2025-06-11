const router = require('express').Router();
const controller = require('../controllers/order.controller');

router.get('/', controller.getOrders);
router.post('/', controller.createOrder);
router.get('/:orderId', controller.getOrderById);
router.put('/:orderId/status', controller.updateOrderStatus);

module.exports = router;