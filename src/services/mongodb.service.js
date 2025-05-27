const mongoose = require('mongoose');

const connectDB = async (mongoUrl) => {
    try {
        await mongoose.connect(mongoUrl);
        console.log('Connect to db successfully!');
    } catch (error) {
        console.log(`Cannot connect to db ${error}`);
    }
};

module.exports = connectDB;