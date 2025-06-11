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
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const UserModel = mongoose.model('Users', UserShema);
module.exports = UserModel;