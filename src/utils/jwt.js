const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role },
        process.env.JWT_SECRET, { expiresIn: '30d' }
    );
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken
};