const jwt = require('jsonwebtoken');
require('dotenv').config();

const getAccessToken = async (payload) => {
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: '1d'
    });
    return token;
};

module.exports = { getAccessToken };
