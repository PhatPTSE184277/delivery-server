const Food = require('../models/food.model');
const RestaurantModel = require('../models/restaurant.model');
const mongoose = require('mongoose');

const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await RestaurantModel.find();

        if (!restaurants || restaurants.length === 0) {
            return res.status(404).json({
                message: 'No restaurants found'
            });
        }

        return res.status(200).json({
            data: {
                restaurants
            }
        });
    } catch (error) {
        console.error('Get restaurant error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const getRestaurant = async (req, res) => {
    const { id } = req.params;
    try {
        const restaurant = await RestaurantModel.findById(id);

        if (!restaurant) {
            return res.status(404).json({
                message: 'No restaurant found'
            });
        }

        const foods = await Food.find({
            restaurantId: new mongoose.Types.ObjectId(id)
        });

        return res.status(200).json({
            data: {
                restaurant: {
                    ...restaurant.toObject(),
                    foods
                }
            }
        });
    } catch (error) {
        console.error('Get restaurant error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

module.exports = { getAllRestaurants, getRestaurant };