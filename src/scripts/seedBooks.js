require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Book = require('../models/Book');

// Sample books data
const books = [{
        title: "Data Structures and Algorithms in Java",
        author: "Robert Lafore",
        description: "Comprehensive guide to data structures and algorithms using Java programming language.",
        price: 25.99,
        pageCount: 800,
        coverImage: "/images/books/dsa-java.jpg",
        category: "Computer Science"
    },
    {
        title: "Clean Code: A Handbook of Agile Software Craftsmanship",
        author: "Robert C. Martin",
        description: "A guide to writing clean, maintainable code and the principles of software craftsmanship.",
        price: 29.99,
        pageCount: 464,
        coverImage: "/images/books/clean-code.jpg",
        category: "Software Engineering"
    },
    {
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
        description: "Widely known as the 'CLRS' textbook, this is a comprehensive reference on computer algorithms.",
        price: 35.99,
        pageCount: 1312,
        coverImage: "/images/books/clrs.jpg",
        category: "Computer Science"
    },
    {
        title: "Design Patterns: Elements of Reusable Object-Oriented Software",
        author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
        description: "The definitive guide to design patterns in software engineering, written by the 'Gang of Four'.",
        price: 27.99,
        pageCount: 416,
        coverImage: "/images/books/design-patterns.jpg",
        category: "Software Engineering"
    },
    {
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt, David Thomas",
        description: "Practical advice for programmers to improve their craft and career.",
        price: 24.99,
        pageCount: 352,
        coverImage: "/images/books/pragmatic-programmer.jpg",
        category: "Software Engineering"
    },
    {
        title: "Artificial Intelligence: A Modern Approach",
        author: "Stuart Russell, Peter Norvig",
        description: "The standard textbook in artificial intelligence, covering the full spectrum of AI techniques.",
        price: 39.99,
        pageCount: 1136,
        coverImage: "/images/books/ai-modern-approach.jpg",
        category: "Artificial Intelligence"
    },
    {
        title: "Database Systems: The Complete Book",
        author: "Hector Garcia-Molina, Jeffrey D. Ullman, Jennifer Widom",
        description: "Comprehensive introduction to database systems and database design.",
        price: 32.99,
        pageCount: 1119,
        coverImage: "/images/books/database-systems.jpg",
        category: "Database"
    },
    {
        title: "Computer Networking: A Top-Down Approach",
        author: "James F. Kurose, Keith W. Ross",
        description: "A leading textbook on computer networking that takes a top-down approach.",
        price: 28.99,
        pageCount: 800,
        coverImage: "/images/books/computer-networking.jpg",
        category: "Networking"
    },
    {
        title: "Operating System Concepts",
        author: "Abraham Silberschatz, Peter B. Galvin, Greg Gagne",
        description: "Known as the 'dinosaur book', this is a classic text on operating system principles.",
        price: 31.99,
        pageCount: 976,
        coverImage: "/images/books/os-concepts.jpg",
        category: "Operating Systems"
    },
    {
        title: "Machine Learning: A Probabilistic Perspective",
        author: "Kevin P. Murphy",
        description: "A comprehensive introduction to machine learning that emphasizes a probabilistic approach.",
        price: 45.99,
        pageCount: 1104,
        coverImage: "/images/books/ml-probabilistic.jpg",
        category: "Machine Learning"
    }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xerox')
    .then(async() => {
        console.log('MongoDB connected successfully');

        try {
            // Clear existing books
            await Book.deleteMany({});
            console.log('Existing books deleted');

            // Insert sample books
            const createdBooks = await Book.insertMany(books);
            console.log(`${createdBooks.length} books inserted into the database`);

            mongoose.connection.close();
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error seeding database:', error);
            mongoose.connection.close();
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });