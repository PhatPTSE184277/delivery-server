const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
    {
        foodId: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
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
const CartModel = mongoose.model('Cart', CartSchema);

module.exports = CartModel;
