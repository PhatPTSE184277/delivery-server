const FoodModel = require('../models/food.model');

const getFood = async (req, res) => {
    const { id } = req.params;
    try {
        const food = await FoodModel.findOne({ id: id });

        if (!food) {
            return res.status(404).json({
                message: 'No food found'
            });
        }
        
        return res.status(200).json({
            data: {
                food: food
            }
        });
    } catch (error) {
        console.error('Get food error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = { getFood }