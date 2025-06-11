const mongoose = require('mongoose');

const UserShema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailOTP: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

const UserModel = mongoose.model('Users', UserShema);
module.exports = UserModel;