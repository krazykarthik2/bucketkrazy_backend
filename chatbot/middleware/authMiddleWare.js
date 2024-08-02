const jwt = require('jsonwebtoken');
const { User } = require('../models');

const secret = process.env.JWT_SECRET;  // Make sure to use a strong secret key in production

// Middleware to authenticate the user
exports.authenticate = async(req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.username = decoded.username;

        // Check if user exists
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
