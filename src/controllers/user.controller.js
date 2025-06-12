const UserModel = require('../models/user.model');

const getUser = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        
        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized access'
            });
        }
        
        const user = await UserModel.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        
        return res.status(200).json({
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        
        if (!username) {
            return res.status(400).json({
                message: 'Username is required'
            });
        }
        
        const user = await UserModel.findOne({ username }).select('username email isEmailVerified');
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        
        return res.status(200).json({
            data: {
                username: user.username,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        console.error('Get user by username error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

module.exports = { getUser, getUserByUsername }