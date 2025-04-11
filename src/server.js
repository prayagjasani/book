const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const xeroxRoutes = require('./routes/xerox');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB - commented out for testing without MongoDB
/* 
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
*/
console.log('MongoDB connection skipped for development');

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
// Disable database-dependent routes for testing
// app.use('/auth', authRoutes);
// app.use('/user', userRoutes);
// app.use('/admin', adminRoutes);
// app.use('/xerox', xeroxRoutes);
// app.use('/orders', orderRoutes);
// app.use('/payments', paymentRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('home');
});

// Sample books data
const books = [{
        id: 1,
        title: "Data Structures and Algorithms in Java",
        author: "Robert Lafore",
        description: "Comprehensive guide to data structures and algorithms using Java programming language.",
        price: 25.99,
        pageCount: 800,
        coverImage: "/images/books/dsa-java.jpg",
        category: "Computer Science"
    },
    {
        id: 2,
        title: "Clean Code: A Handbook of Agile Software Craftsmanship",
        author: "Robert C. Martin",
        description: "A guide to writing clean, maintainable code and the principles of software craftsmanship.",
        price: 29.99,
        pageCount: 464,
        coverImage: "/images/books/clean-code.jpg",
        category: "Software Engineering"
    },
    {
        id: 3,
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
        description: "Widely known as the 'CLRS' textbook, this is a comprehensive reference on computer algorithms.",
        price: 35.99,
        pageCount: 1312,
        coverImage: "/images/books/clrs.jpg",
        category: "Computer Science"
    },
    {
        id: 4,
        title: "Design Patterns: Elements of Reusable Object-Oriented Software",
        author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
        description: "The definitive guide to design patterns in software engineering, written by the 'Gang of Four'.",
        price: 27.99,
        pageCount: 416,
        coverImage: "/images/books/design-patterns.jpg",
        category: "Software Engineering"
    },
    {
        id: 5,
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt, David Thomas",
        description: "Practical advice for programmers to improve their craft and career.",
        price: 24.99,
        pageCount: 352,
        coverImage: "/images/books/pragmatic-programmer.jpg",
        category: "Software Engineering"
    },
    {
        id: 6,
        title: "Artificial Intelligence: A Modern Approach",
        author: "Stuart Russell, Peter Norvig",
        description: "The standard textbook in artificial intelligence, covering the full spectrum of AI techniques.",
        price: 39.99,
        pageCount: 1136,
        coverImage: "/images/books/ai-modern-approach.jpg",
        category: "Artificial Intelligence"
    },
    {
        id: 7,
        title: "Database Systems: The Complete Book",
        author: "Hector Garcia-Molina, Jeffrey D. Ullman, Jennifer Widom",
        description: "Comprehensive introduction to database systems and database design.",
        price: 32.99,
        pageCount: 1119,
        coverImage: "/images/books/database-systems.jpg",
        category: "Database"
    },
    {
        id: 8,
        title: "Computer Networking: A Top-Down Approach",
        author: "James F. Kurose, Keith W. Ross",
        description: "A leading textbook on computer networking that takes a top-down approach.",
        price: 28.99,
        pageCount: 800,
        coverImage: "/images/books/computer-networking.jpg",
        category: "Networking"
    },
    {
        id: 9,
        title: "Operating System Concepts",
        author: "Abraham Silberschatz, Peter B. Galvin, Greg Gagne",
        description: "Known as the 'dinosaur book', this is a classic text on operating system principles.",
        price: 31.99,
        pageCount: 976,
        coverImage: "/images/books/os-concepts.jpg",
        category: "Operating Systems"
    },
    {
        id: 10,
        title: "Machine Learning: A Probabilistic Perspective",
        author: "Kevin P. Murphy",
        description: "A comprehensive introduction to machine learning that emphasizes a probabilistic approach.",
        price: 45.99,
        pageCount: 1104,
        coverImage: "/images/books/ml-probabilistic.jpg",
        category: "Machine Learning"
    }
];

// Books route
app.get('/books', (req, res) => {
    res.render('books', { books });
});

// Book detail route
app.get('/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find(b => b.id === bookId);

    if (!book) {
        return res.status(404).render('404');
    }

    res.render('book-detail', { book });
});

// Temporary routes for testing without database
app.get('/xerox', (req, res) => {
    res.render('home', { message: 'Xerox services would be displayed here' });
});

app.get('/auth/login', (req, res) => {
    res.render('home', { message: 'Login page would be displayed here' });
});

app.get('/auth/register', (req, res) => {
    res.render('home', { message: 'Register page would be displayed here' });
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