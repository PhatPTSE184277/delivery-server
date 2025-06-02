const router = require('express').Router();
const controller = require('../controllers/food.controller');

router.get('/:id', controller.getFood);

module.exports = router;