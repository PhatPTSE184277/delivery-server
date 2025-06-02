const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);
BookmarkSchema.index({ username: 1, restaurantId: 1 }, { unique: true });
const BookmarkModel = mongoose.model('Bookmark', BookmarkSchema);
module.exports = BookmarkModel;