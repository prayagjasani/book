# Xerox E-Commerce Platform

A Node.js web application for book and PDF xerox services. This platform allows users to order xerox copies of books from a catalog or upload their own PDF files for printing, with various customization options.

## Features

- **Book Catalog**: Browse books available for xerox copies
- **PDF Upload**: Upload PDFs for printing
- **Customization Options**: Choose paper type, binding, quality, etc.
- **User Authentication**: Register, login, and manage your account
- **Shopping Cart**: Add items to cart and checkout
- **Order Tracking**: Track the status of your orders
- **Admin Panel**: Manage products, orders, and users

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templates, Bootstrap 5
- **Authentication**: JWT, bcrypt
- **Payment Processing**: Stripe API
- **File Management**: Multer for file uploads

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/prayagjasani/book.git
   cd book
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following environment variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/xerox
   JWT_SECRET=your_jwt_secret_key_here
   SESSION_SECRET=your_session_secret_key_here
   NODE_ENV=development
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Database schemas
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   ├── views/          # EJS templates
│   │   ├── partials/   # Reusable template parts
│   │   └── ...
│   ├── public/         # Static files
│   │   ├── css/        # Stylesheets
│   │   ├── js/         # Client-side JavaScript
│   │   ├── images/     # Images
│   │   └── uploads/    # User uploads
│   └── server.js       # Entry point
├── .env                # Environment variables
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## API Endpoints

- `/auth` - Authentication routes
- `/user` - User profile and settings
- `/books` - Book catalog and details
- `/xerox` - Xerox service routes
- `/orders` - Order management
- `/payments` - Payment processing

## Contributors

- Prayag Jasani

## License

This project is licensed under the ISC License. 