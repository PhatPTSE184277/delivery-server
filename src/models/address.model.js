const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'Users'
        },
        title: {
            type: String,
            required: true,
            enum: ['Home', 'Work', 'Other']
        },
        address: {
            type: String,
            required: true
        },
        coordinates: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

AddressSchema.index({ username: 1 });
const AddressModel = mongoose.model('Addresses', AddressSchema);
module.exports = AddressModel;