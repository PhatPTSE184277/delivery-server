const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'Restaurants'
        },
        userId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'Users'
        }
    },
    {
        timestamps: true
    }
);
BookmarkSchema.index({ username: 1, restaurantId: 1 }, { unique: true });
const BookmarkModel = mongoose.model('Bookmarks', BookmarkSchema);
module.exports = BookmarkModel;