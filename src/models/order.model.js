const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'Users'
        },
        items: [{
            foodId: {
                type: String,
                required: true
            },
            name: String,
            price: Number,
            quantity: Number,
            image: String,
            total: Number
        }],
        totalAmount: {
            type: Number,
            required: true
        },
        deliveryAddress: {
            title: String,
            address: String,
            coordinates: {
                latitude: Number,
                longitude: Number
            }
        },
        restaurantId: String,
        status: {
            type: String,
            enum: ['pending_payment', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
            default: 'confirmed'
        },        paymentMethod: {
            type: String,
            enum: ['Cash on Delivery'],
            required: true,
            default: 'Cash on Delivery'
        },
        deliveryFee: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Sửa indexes để match với schema
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentMethod: 1 });
// Bỏ orderId và username indexes vì không có trong schema

const OrderModel = mongoose.model('Orders', OrderSchema);
module.exports = OrderModel;