const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const { getAccessToken } = require('../utils/getAccessToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationOTP } = require('../services/email.service');


const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};


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

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 60 * 1000);

        const newUser = new UserModel({
            username,
            email,
            password: hashPassword,
            emailOTP: otp,
            otpExpires: otpExpires
        });

        await newUser.save();

        await sendVerificationOTP(email, otp, username);        res.status(200).json({
            message: 'Registration successful! Please check your email for verification code.',
            success: true,
            data: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                isEmailVerified: newUser.isEmailVerified
            }
        });
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        console.log('Verifying OTP:', { email, otp }); // Debug

        // Tìm user theo email trước
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }

        // Nếu đã verify rồi
        if (user.isEmailVerified) {
            return res.status(200).json({
                message: 'Email already verified! You can login now.',
                success: true
            });
        }

        // Check OTP
        if (user.emailOTP !== otp) {
            return res.status(400).json({
                message: 'Invalid OTP',
                success: false
            });
        }

        // Check thời hạn OTP
        if (user.otpExpires && user.otpExpires < new Date()) {
            return res.status(400).json({
                message: 'OTP expired',
                success: false
            });
        }

        // Verify thành công
        user.isEmailVerified = true;
        user.emailOTP = null;
        user.otpExpires = null;
        await user.save();

        console.log('OTP verified successfully');

        res.status(200).json({
            message: 'Email verified successfully! You can now login.',
            success: true
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

const resendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                message: 'Email does not exist'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                message: 'Email is already verified'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.emailOTP = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendVerificationOTP(email, otp, user.username);        res.status(200).json({
            message: 'OTP has been resent to your email',
            success: true
        });
    } catch (error) {
        res.status(500).json({
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

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in'
            });
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
                _id: user._id,
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

const validateToken = (req, res) => {
    res.status(200).json({
        valid: true,
        message: 'Token is valid'
    });
};

module.exports = { register, login, verifyOTP, validateToken, resendOTP };