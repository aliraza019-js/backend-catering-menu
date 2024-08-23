require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { generateInvoice } = require('./generateInvoice'); // Import the generateInvoice function

let orderInfo = {
    invoiceNumber: 10123,
    customer: {
        firstName: 'Ali',
        lastName: 'Raza',
        email: 'aliraza.techintec@gmail.com',
        phone: '03334039462'
    },
    subtotal: 1233,
    tax: 129,
    total: '123.121',
    items: [
        {
            "id": "prod_1H8gGJ2eZvKYlo2CsP7l5Vn8",
            "object": "product",
            "active": true,
            "attributes": ["color", "size"],
            "created": 1615498400,
            "description": "Comfortable cotton t-shirt available in various sizes and colors.",
            "images": [
                "https://example.com/images/tshirt1.jpg",
                "https://example.com/images/tshirt2.jpg"
            ],
            "livemode": false,
            "metadata": {
                "category": "apparel",
                "brand": "CoolTees"
            },
            "name": "Cotton T-Shirt",
            "shippable": true,
            "type": "good",
            "unit_label": "shirt",
            "updated": 1615498400
        },
        {
            "id": "prod_1H8gGJ2eZvKYlo2CsP7l6Bn9",
            "object": "product",
            "active": true,
            "attributes": ["memory", "color"],
            "created": 1615498400,
            "description": "High-performance laptop with advanced features and a sleek design.",
            "images": [
                "https://example.com/images/laptop1.jpg",
                "https://example.com/images/laptop2.jpg"
            ],
            "livemode": false,
            "metadata": {
                "category": "electronics",
                "brand": "TechMaster"
            },
            "name": "Laptop Pro 2021",
            "shippable": true,
            "type": "good",
            "unit_label": "unit",
            "updated": 1615498400
        }
    ],
};

const invoicePath = path.join(__dirname, 'invoice.pdf');
generateInvoice(orderInfo, invoicePath);

const transporter = nodemailer.createTransport({
    service: 'gmail', // Change this to your email service provider
    auth: {
        user: 'aliraza.techintec@gmail.com',
        pass: 'sszf prkk aqmc vslr',
    },
});

const mailOptions = {
    from: 'Catering@AladdinsHouston.com',
    to: 'aliraza.techintec@gmail.com',
    subject: 'Catering Menu',
    text: 'This is a test email to verify that Nodemailer is With Ali Raza.',
    attachments: [
        {
            filename: 'invoice.pdf',
            path: invoicePath
        }
    ]
};

transporter.sendMail(mailOptions, (error, info) => {
    fs.unlinkSync(invoicePath); // Clean up the file after sending
    if (error) {
        return console.log('Error sending email:', error);
    }
    console.log('Email sent successfully:', info.response);
});
