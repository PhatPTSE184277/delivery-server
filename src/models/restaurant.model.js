const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            required: true,
            enum: ['Take-Away', 'Dine-In', 'Cafe']
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
        distance: {
            type: Number,
            required: true,
            min: 0
        },
        time: {
            type: Number,
            required: true,
            min: 0
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
restaurantSchema.index({ distance: 1 });
restaurantSchema.index({ time: 1 });
restaurantSchema.index({ type: 1 });

const RestaurantModel = mongoose.model('Restaurant', restaurantSchema);

module.exports = RestaurantModel;
