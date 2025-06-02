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

module.exports = { getUser }