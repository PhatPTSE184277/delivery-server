const AddressModel = require('../models/address.model');
const mongoose = require('mongoose');

const saveAddress = async (req, res) => {
    const { userId, title, address, coordinates } = req.body;

    try {
        if (!userId || !title || !address || !coordinates) {
            return res.status(400).json({
                status: false,
                message: 'Missing required fields'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid userId'
            });
        }

        const existingAddress = await AddressModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            title: title
        });

        if (existingAddress) {
            if (req.body.isDefault) {
                await AddressModel.updateMany(
                    { userId: new mongoose.Types.ObjectId(userId) },
                    { isDefault: false }
                );
            }

            const updatedAddress = await AddressModel.findByIdAndUpdate(
                existingAddress._id,
                {
                    address: address,
                    coordinates: coordinates,
                    isDefault: req.body.isDefault || false
                },
                { new: true }
            );

            return res.status(200).json({
                status: true,
                message: 'Address updated successfully',
                data: updatedAddress
            });
        } else {
            if (req.body.isDefault) {
                await AddressModel.updateMany(
                    { userId: new mongoose.Types.ObjectId(userId) },
                    { isDefault: false }
                );
            }

            const newAddress = await AddressModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                title,
                address,
                coordinates,
                isDefault: req.body.isDefault || false
            });

            return res.status(201).json({
                status: true,
                message: 'Address saved successfully',
                data: newAddress
            });
        }
    } catch (error) {
        console.error('Save address error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot save address',
            error: error.message
        });
    }
};

const getAddresses = async (req, res) => {
    const { userId } = req.query;

    try {
        if (!userId) {
            return res.status(400).json({
                status: false,
                message: 'UserId is required'
            });
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid userId'
            });
        }

        const addresses = await AddressModel.find({ 
            userId: new mongoose.Types.ObjectId(userId)
        }).sort({ isDefault: -1, createdAt: -1 });
        
        return res.status(200).json({
            status: true,
            data: addresses
        });
    } catch (error) {
        console.error('Get addresses error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot get addresses',
            error: error.message
        });
    }
};

const updateAddress = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid address ID'
            });
        }

        if (updateData.isDefault && updateData.userId) {
            await AddressModel.updateMany(
                { userId: new mongoose.Types.ObjectId(updateData.userId) },
                { isDefault: false }
            );
        }

        const updatedAddress = await AddressModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({
                status: false,
                message: 'Address not found'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Address updated successfully',
            data: updatedAddress
        });
    } catch (error) {
        console.error('Update address error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot update address',
            error: error.message
        });
    }
};

const deleteAddress = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
        if (!userId) {
            return res.status(400).json({
                status: false,
                message: 'UserId is required'
            });
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid ID format'
            });
        }

        const deletedAddress = await AddressModel.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId)
        });

        if (!deletedAddress) {
            return res.status(404).json({
                status: false,
                message: 'Address not found'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Delete address error:', error);
        return res.status(500).json({
            status: false,
            message: 'Cannot delete address',
            error: error.message
        });
    }
};

module.exports = { saveAddress, getAddresses, updateAddress, deleteAddress };