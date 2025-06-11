const router = require('express').Router();
const controller = require('../controllers/address.controller');

router.get('/', controller.getAddresses);
router.post('/', controller.saveAddress);
router.put('/:id', controller.updateAddress);
router.delete('/:id', controller.deleteAddress);

module.exports = router;