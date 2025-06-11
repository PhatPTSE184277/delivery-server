const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
    {
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Foods'
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Users'
        },
        count: {
            type: Number,
            default: 1,
            min: 1
        }
    },
    {
        timestamps: true
    }
);

CartSchema.index({ userId: 1, foodId: 1 }, { unique: true });
const CartModel = mongoose.model('Carts', CartSchema);

module.exports = CartModel;