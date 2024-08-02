const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;  // Make sure to use a strong secret key in production
console.log(process.env.MONGO_URI);
// Register a new user
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// Login and issue JWT
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ username: user.username }, secret, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error logging in', error });
    }
};
