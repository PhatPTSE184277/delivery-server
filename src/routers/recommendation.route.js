const express = require('express');
const router = express.Router();
const RecommendationController = require('../controllers/recommendation.controller');

router.get('/', RecommendationController.getRecommendations);

module.exports = router;