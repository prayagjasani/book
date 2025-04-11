require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const XeroxService = require('../models/XeroxService');

// Sample services data
const services = [{
        name: "Black & White Printing",
        description: "Standard black and white printing service for documents, reports, and other text-heavy materials. Affordable and quick turnaround.",
        price: 0.10,
        priceUnit: "page",
        category: "Printing",
        isColor: false,
        paperSize: "A4",
        estimatedTime: "Same day",
        additionalOptions: [{
                name: "Premium Paper (90 GSM)",
                price: 0.05,
                description: "Higher quality paper for a more professional finish"
            },
            {
                name: "Double-sided printing",
                price: -0.02,
                description: "Print on both sides of the paper (small discount per page)"
            }
        ],
        image: "/images/services/bw-printing.jpg",
        isActive: true
    },
    {
        name: "Color Printing",
        description: "High-quality color printing for presentations, marketing materials, and anything that needs to stand out with vibrant colors.",
        price: 0.50,
        priceUnit: "page",
        category: "Printing",
        isColor: true,
        paperSize: "A4",
        estimatedTime: "Same day",
        additionalOptions: [{
                name: "High-End Paper (120 GSM)",
                price: 0.10,
                description: "Premium paper for the best color reproduction"
            },
            {
                name: "Glossy Finish",
                price: 0.15,
                description: "Adds a glossy finish for photos and graphics"
            }
        ],
        image: "/images/services/color-printing.jpg",
        isActive: true
    },
    {
        name: "Spiral Binding",
        description: "Professional spiral binding for reports, manuals, and presentations. Documents can be opened flat and folded back for easy reading.",
        price: 3.99,
        priceUnit: "document",
        category: "Binding",
        isColor: false,
        paperSize: "A4",
        estimatedTime: "1 day",
        additionalOptions: [{
                name: "Colored Spiral",
                price: 1.00,
                description: "Choose from various color options for the spiral binding"
            },
            {
                name: "Clear Front Cover",
                price: 0.75,
                description: "Add a transparent front cover to protect your document"
            }
        ],
        image: "/images/services/spiral-binding.jpg",
        isActive: true
    },
    {
        name: "Hardcover Binding",
        description: "Premium hardcover binding for theses, portfolios, and important presentations. Gives your documents a professional, book-like finish.",
        price: 9.99,
        priceUnit: "document",
        category: "Binding",
        isColor: false,
        paperSize: "A4",
        estimatedTime: "2-3 days",
        additionalOptions: [{
                name: "Embossed Text",
                price: 2.99,
                description: "Add embossed text to the cover for a professional touch"
            },
            {
                name: "Premium Cover Material",
                price: 3.99,
                description: "Choose from leather-like or other premium materials"
            }
        ],
        image: "/images/services/hardcover-binding.jpg",
        isActive: true
    },
    {
        name: "Large Format Printing",
        description: "Print posters, banners, architectural plans, and other large documents with our high-quality large format printing service.",
        price: 4.99,
        priceUnit: "page",
        category: "Specialty",
        isColor: true,
        paperSize: "A3",
        estimatedTime: "1-2 days",
        additionalOptions: [{
                name: "Waterproof Paper",
                price: 2.00,
                description: "Waterproof paper for outdoor use"
            },
            {
                name: "Custom Size",
                price: 1.50,
                description: "Custom dimensions for special requirements"
            }
        ],
        image: "/images/services/large-format.jpg",
        isActive: true
    },
    {
        name: "Document Scanning",
        description: "Convert your physical documents to digital format. We offer high-resolution scanning for documents of all sizes.",
        price: 0.25,
        priceUnit: "page",
        category: "Digital",
        isColor: true,
        paperSize: "A4",
        estimatedTime: "1 day",
        additionalOptions: [{
                name: "OCR Processing",
                price: 1.99,
                description: "Convert scanned text to editable format"
            },
            {
                name: "Searchable PDF",
                price: 1.50,
                description: "Create searchable PDF documents"
            }
        ],
        image: "/images/services/document-scanning.jpg",
        isActive: true
    }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/xerox')
    .then(async() => {
        console.log('MongoDB connected successfully');

        try {
            // Clear existing services
            await XeroxService.deleteMany({});
            console.log('Existing services deleted');

            // Insert sample services
            const createdServices = await XeroxService.insertMany(services);
            console.log(`${createdServices.length} services inserted into the database`);

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