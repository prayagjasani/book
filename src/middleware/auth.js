const { verifyToken } = require('../utils/jwt');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    try {
        // Check for token in session
        if (req.session.user && req.session.token) {
            return next();
        }

        // Or check for jwt token in headers
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);

            if (decoded) {
                req.user = decoded;
                return next();
            }
        }

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Redirect to login page for regular requests
        req.flash('error_msg', 'Please log in to access this resource');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        req.flash('error_msg', 'Authentication error');
        res.redirect('/auth/login');
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    try {
        // Check session user role
        if (req.session.user && req.session.user.role === 'admin') {
            return next();
        }

        // Or check JWT token
        if (req.user && req.user.role === 'admin') {
            return next();
        }

        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(403).json({ message: 'Access denied' });
        }

        req.flash('error_msg', 'You do not have permission to access this resource');
        res.redirect('/');
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(403).json({ message: 'Access denied' });
        }
        req.flash('error_msg', 'Authentication error');
        res.redirect('/');
    }
};

module.exports = {
    isAuthenticated,
    isAdmin
};