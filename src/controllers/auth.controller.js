const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const { getAccessToken } = require('../utils/getAccessToken');
const jwt = require('jsonwebtoken');

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
    return usernameRegex.test(username);
};

const register = async (req, res) => {
    const body = req.body;
    const { username, email, password } = body;

    try {

        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Please fill up all fields'
            });
        }

        if (!validateUsername(username)) {
            return res.status(400).json({
                message: 'Username must be at least 3 characters and contain only letters, numbers'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                message: 'Please provide a valid email address'
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long'
            });
        }

        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail) {
            throw new Error('Email already exists.');
        }

        const existingUsername = await UserModel.findOne({ username });
        if (existingUsername) {
            throw new Error('Username already exists.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        body.password = hashPassword;

        const newUser = new UserModel(body);
        await newUser.save();

        delete newUser._doc.password;

        newUser._doc.token = await getAccessToken({
            _id: newUser._id,
            email: newUser.email,
            username: newUser.username
        });

        res.status(200).json({
            message: 'Register successfully',
            data: newUser
        });
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const login = async (req, res) => {
    const body = req.body;
    const { username, password } = body;

    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            throw new Error('The account does not exist');
        }

        const isMatchPassword = await bcrypt.compare(password, user.password);

        if (!isMatchPassword) {
            throw new Error('Username or password incorrect');
        }

        const token = await getAccessToken({
            _id: user._id,
            email: user.email,
            username: user.username
        });

        res.status(200).json({
            message: 'Login successfully',
             data: {
                token,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({
                message: 'Refresh token is required'
            });
        }
        
        const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);
        
        const user = await UserModel.findById(decoded._id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        
        const newAccessToken = await getAccessToken({
            _id: user._id,
            email: user.email,
            username: user.username 
        }); 
        
        return res.status(200).json({
            message: 'Token refreshed successfully',
            data: {
                token: newAccessToken
            }
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Refresh token has expired, please login again'
            });
        }
        
        return res.status(401).json({
            message: error.message || 'Invalid refresh token'
        });
    }
};

module.exports = { register, login, refreshToken };
