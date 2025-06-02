const RestaurantModel = require('../models/restaurant.model');

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
        const restaurant = await RestaurantModel.aggregate([
            {
                $match: { id: id }
            },
            {
                $lookup: {
                    from: 'foods',
                    localField: 'id',
                    foreignField: 'restaurantId',
                    as: 'foods'
                }
            }
        ]);

        if (!restaurant || restaurant.length === 0) {
            return res.status(404).json({
                message: 'No restaurant found'
            });
        }
        
        return res.status(200).json({
            data: {
                restaurant: restaurant[0]
            }
        });
    } catch (error) {
        console.error('Get restaurant error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = { getAllRestaurants, getRestaurant }