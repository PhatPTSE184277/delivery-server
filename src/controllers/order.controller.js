const OrderModel = require('../models/order.model');
const CartModel = require('../models/cart.model');
const mongoose = require('mongoose');


const createOrder = async (req, res) => {
    const { 
        userId,
        items, 
        totalAmount, 
        deliveryAddress, 
        restaurantId, 
        paymentMethod, 
        deliveryFee,
        status
    } = req.body;

    try {
        console.log('Creating order with data:', req.body);

        if (!userId || !items || items.length === 0 || !totalAmount) {
            return res.status(400).json({
                status: false,
                message: 'Missing required fields: userId, items, or totalAmount'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid userId'
            });
        }        const allowedPaymentMethods = ['Cash on Delivery'];
        const selectedPaymentMethod = paymentMethod || 'Cash on Delivery';
        
        if (!allowedPaymentMethods.includes(selectedPaymentMethod)) {
            return res.status(400).json({
                status: false,
                message: `Invalid payment method. Only Cash on Delivery is supported.`
            });
        }

        const newOrder = await OrderModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            items,
            totalAmount,
            deliveryAddress,
            restaurantId: restaurantId || 'default-restaurant',
            paymentMethod: selectedPaymentMethod,
            deliveryFee: deliveryFee || 0,
            status: status || 'confirmed' // Luôn là confirmed vì chỉ có Cash on Delivery
        });

        console.log('Order created successfully:', newOrder);

        try {
            await CartModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
            console.log('Cart cleared for user:', userId);
        } catch (cartError) {
            console.warn('Failed to clear cart:', cartError);
        }

        return res.status(201).json({
            status: true,
            message: 'Order created successfully',
            data: newOrder
        });
    } catch (error) {
        console.error('Create order error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: false,
                message: 'Validation error',
                error: error.message
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Cannot create order',
            error: error.message
        });
    }
};

const getOrders = async (req, res) => {
    const { userId, paymentMethod } = req.query;

    try {
        let query = {};
        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid userId'
                });
            }
            query.userId = new mongoose.Types.ObjectId(userId);
        }        if (paymentMethod) {
            const allowedPaymentMethods = ['Cash on Delivery'];
            if (allowedPaymentMethods.includes(paymentMethod)) {
                query.paymentMethod = paymentMethod;
            }
        }

        const orders = await OrderModel.find(query)
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            status: true,
            data: orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot get orders'
        });
    }
};

const getOrderById = async (req, res) => {
    const { orderId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid order ID'
            });
        }

        const order = await OrderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                status: false,
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            status: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot get order'
        });
    }
};

const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params; 
    const { status } = req.body;

    try {
        console.log(`Updating order ${orderId} status to:`, status);

        // Sửa: Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid order ID'
            });
        }

        const allowedStatuses = ['pending_payment', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                status: false,
                message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
            });
        }

        const updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            { 
                status,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                status: false,
                message: 'Order not found'
            });
        }

        console.log('Order status updated successfully:', updatedOrder);

        return res.status(200).json({
            status: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot update order status',
            error: error.message
        });
    }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };