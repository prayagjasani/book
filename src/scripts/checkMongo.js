const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Database connection string
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/xerox';

console.log(`Attempting to connect to MongoDB at: ${uri}`);

// Connect to MongoDB
mongoose.connect(uri)
    .then(() => {
        console.log('MongoDB connected successfully!');
        console.log('Connection details:', mongoose.connection);
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });