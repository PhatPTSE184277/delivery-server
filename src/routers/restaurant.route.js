const router = require('express').Router();
const controller = require('../controllers/restaurant.controller');

router.get('/', controller.getAllRestaurants);
router.get('/:id', controller.getRestaurant);

module.exports = router;