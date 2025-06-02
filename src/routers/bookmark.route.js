const router = require('express').Router();
const controller = require('../controllers/bookmark.controller');

router.get('/', controller.getBookmarks);
router.post('/:restaurantId', controller.addBookmark);
router.delete('/:restaurantId', controller.removeBookmark);

module.exports = router;