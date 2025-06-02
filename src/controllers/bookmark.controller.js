const BookmarkModel = require('../models/bookmark.model');

const addBookmark = async (req, res) => {
    const { restaurantId } = req.params;
    const { username } = req.body;

    try {
        const bookmark = await BookmarkModel.findOneAndUpdate(
            { restaurantId, username },
            { restaurantId, username },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            status: true,
            message: 'Restaurant bookmarked successfully',
            data: bookmark
        });
    } catch (error) {
        console.error('Add bookmark error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot bookmark restaurant'
        });
    }
};

const removeBookmark = async (req, res) => {
    const { restaurantId } = req.params;
    const { username } = req.body;

    try {
        const bookmark = await BookmarkModel.findOneAndDelete({ restaurantId, username });

        if (!bookmark) {
            return res.status(404).json({
                status: false,
                message: 'Bookmark not found'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Bookmark removed successfully'
        });
    } catch (error) {
        console.error('Remove bookmark error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot remove bookmark'
        });
    }
};

const getBookmarks = async (req, res) => {
    const { username } = req.query;

    try {
        const bookmarks = await BookmarkModel.aggregate([
            {
                $match: { 
                    username: username 
                }
            },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurantId',
                    foreignField: 'id',
                    as: 'restaurant'
                }
            },
            {
                $unwind: {
                    path: '$restaurant',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    restaurantId: 1,
                    restaurant: {
                        _id: '$restaurant._id',
                        id: '$restaurant.id',
                        name: '$restaurant.name',
                        image: '$restaurant.image',
                        description: '$restaurant.description',
                        rating: '$restaurant.rating',
                        address: '$restaurant.address'
                    },
                    createdAt: 1
                }
            }
        ]);

        return res.status(200).json({
            status: true,
            message: 'Bookmarks fetched successfully',
            data: bookmarks
        });
    } catch (error) {
        console.error('Get bookmarks error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot get bookmarks'
        });
    }
};

module.exports = { addBookmark, removeBookmark, getBookmarks };