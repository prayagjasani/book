const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Book = require('./models/Book');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
// const xeroxRoutes = require('./routes/xerox');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/xerox')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Flash messages
app.use(flash());

// Set global variables for all routes
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.session.user || null;
    next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
// app.use('/xerox', xeroxRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);

// Books routes
app.get('/books', async(req, res) => {
    try {
        const category = req.query.category;
        const filter = category ? { category } : {};

        const books = await Book.find(filter).sort({ title: 1 });
        res.render('books', { books });
    } catch (error) {
        console.error('Error fetching books:', error);
        req.flash('error_msg', 'Failed to fetch books');
        res.redirect('/');
    }
});

// Book detail route
app.get('/books/:id', async(req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).render('404');
        }

        // Get related books from the same category
        const relatedBooks = await Book.find({
            category: book.category,
            _id: { $ne: book._id }
        }).limit(3);

        res.render('book-detail', { book, relatedBooks });
    } catch (error) {
        console.error('Error fetching book details:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).render('404');
        }
        req.flash('error_msg', 'Failed to fetch book details');
        res.redirect('/books');
    }
});

// Temporary xerox route
app.get('/xerox', (req, res) => {
    res.render('home', { message: 'Xerox services would be displayed here' });
});

// Home route
app.get('/', async(req, res) => {
    try {
        // Get 6 random books for the homepage showcase
        const featuredBooks = await Book.aggregate([
            { $sample: { size: 6 } }
        ]);
        res.render('home', { featuredBooks });
    } catch (error) {
        console.error('Error fetching featured books:', error);
        res.render('home', { featuredBooks: [] });
    }
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});