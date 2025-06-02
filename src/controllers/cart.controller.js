const CartModel = require('../models/cart.model');

const addToCart = async (req, res) => {
    const { foodId } = req.params;
    const { username } = req.body;

    try {
        const updatedCart = await CartModel.findOneAndUpdate(
            { foodId, username },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            status: true,
            message: 'Item added to cart successfully',
            data: updatedCart
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot add item to cart'
        });
    }
};

const removeFromCart = async (req, res) => {
    const { foodId } = req.params;
    const { username } = req.body;

    try {
        const cartItem = await CartModel.findOne({ foodId, username });

        if (!cartItem) {
            return res.status(404).json({
                status: false,
                message: 'Item not found in cart'
            });
        }

        // If count is 1, remove the item entirely
        if (cartItem.count === 1) {
            await CartModel.findOneAndDelete({ foodId, username });
            return res.status(200).json({
                status: true,
                message: 'Item removed from cart successfully'
            });
        }
        // Otherwise just decrement
        else {
            const updatedCart = await CartModel.findOneAndUpdate(
                { foodId, username },
                { $inc: { count: -1 } },
                { new: true }
            );

            return res.status(200).json({
                status: true,
                message: 'Item quantity reduced successfully',
                data: updatedCart
            });
        }
    } catch (error) {
        console.error('Remove from cart error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot remove item from cart'
        });
    }
};

const getCartItems = async (req, res) => {
    const { username } = req.query;

    try {
        const cartItems = await CartModel.aggregate([
            {
                $match: { 
                    username: username 
                }
            },
            {
                $lookup: {
                    from: 'foods',
                    localField: 'foodId',
                    foreignField: 'id',
                    as: 'food'
                }
            },
            {
                $unwind: {
                    path: '$food',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    count: 1,
                    food: {
                        _id: '$food._id',
                        name: '$food.name',
                        id: '$food.id',
                        price: '$food.price',
                        image: '$food.image',
                        description: '$food.description'
                    },
                    itemTotal: { $multiply: ['$count', '$food.price'] }
                }
            }
        ]);

        if (!cartItems || cartItems.length === 0) {
            return res.status(200).json({
                status: true,
                message: 'Cart is empty',
                data: { 
                    cartItems: [],
                    metadata: {
                        itemsTotal: 0,
                        discount: 0,
                        grandTotal: 0
                    }
                }
            });
        }

        const itemsTotal = cartItems.reduce((sum, item) => sum + (item.itemTotal || 0), 0);
        const discount = 0; 
        const grandTotal = itemsTotal - discount;

        return res.status(200).json({
            status: true,
            message: 'Cart items fetched successfully',
            data: {
                cartItems,
                metadata: {
                    itemsTotal,
                    discount,
                    grandTotal
                }
            }
        });
    } catch (error) {
        console.error('Get cart items error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot get items in cart'
        });
    }
};

module.exports = { addToCart, removeFromCart, getCartItems };
