const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        tags: [
            {
                type: String,
                lowercase: true,
                trim: true
            }
        ],
        location: {
            type: String,
            required: true,
            trim: true
        },
        images: {
            logo: {
                type: String,
                required: true
            },
            poster: {
                type: String,
                required: true
            },
            cover: {
                type: String,
                required: true
            }
        },
        categories: [
            {
                type: String,
                required: true,
                trim: true
            }
        ]
    },
    {
        timestamps: true
    }
);

restaurantSchema.index({ name: 'text', tags: 'text' });

const RestaurantModel = mongoose.model('Restaurants', restaurantSchema);

module.exports = RestaurantModel;
