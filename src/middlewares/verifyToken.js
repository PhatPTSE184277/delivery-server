import jwt from 'jsonwebtoken';

export const VerifyToken = (req, res, next) => {
    const headers = req.headers.authorization;
    const accessToken = headers ? headers.split(' ')[1] : '';

    try {
        if (!accessToken) {
            throw new Error('Token not found');
        }

        const verify = jwt.verify(
            accessToken,
            process.env.SECRET_KEY
        );

        if (!verify) {
            throw new Error('Invalid token');
        }
        next();
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};
