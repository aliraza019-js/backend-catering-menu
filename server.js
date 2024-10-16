require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { generateInvoice } = require('./generateInvoice');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
// const { authenticate, authorize } = require('./src/middleware/authMiddleware');
const { ROLES } = require('./src/config/roles');
const orderRoutes = require('./src/routes/orderRoutes');
const customerRoutes =  require('./src/routes/customersRoute')

const app = express();

app.use(bodyParser.json());
// app.use(cors({ origin: process.env.APP_ENV }));
app.use(cors({
  origin: ['https://vcaterings.com', 'http://localhost:8080'], // Add your frontend URL and localhost for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // This allows cookies to be sent with the request if needed
}));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);

const uri = 'mongodb://localhost:27017/cateringOrders';

// MongoDB Connection
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define an Order schema
const orderSchema = new mongoose.Schema({
  customer: {
    name: String,
    email: String,
    address: String,
  },
  items: Array,
  totalAmount: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

// const Order = mongoose.model('Order', orderSchema);

let orderInfo = null;

app.get('/api/products', async (req, res) => {
  const {query} = req
  try {
    const products = await stripe.products?.list({
      limit: query.limit,
    });
    const prices = await stripe.prices?.list({
      limit: query.limit,
    });
  //   console.log('products', products.data.length)

  // getting products data using limits
    const productData = products.data.map(product => {
      const productPrices = prices.data.filter(price => price.product === product.id);
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.images[0],
        category: product?.metadata.category, // Include metadata here
        price: (productPrices[0]?.unit_amount / 100).toFixed(2),
      //   features: product.marketing_features,
        prices: productPrices.map(price => ({
          id: price.id,
          currency: price.currency,
          unit_amount: (productPrices[0]?.unit_amount / 100).toFixed(2),
        })),
      };
    });

    res.json(productData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// app.post('/api/order', authenticate, authorize([ROLES.USER, ROLES.ADMIN]), async(req, res) => {
//   orderInfo = req.body;
//   try {
//     const newOrder = new Order(orderData);
//     await newOrder.save();
//     res.status(200).json({ message: 'Order saved to MongoDB' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to save order' });
//   }
// });

app.post("/create-checkout-session", async (req, res) => {
  const { items, tipAmount, tax } = req.body;

  const line_items = items.map(item => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        images: [item.image],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  if (tipAmount > 0) {
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tip",
        },
        unit_amount: Math.round(tipAmount * 100),
      },
      quantity: 1,
    });
  }

  if (tax > 0) {
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tax",
        },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.APP_ENV}/success`,
      cancel_url: `${process.env.APP_ENV}/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const invoicePath = path.join(__dirname, 'invoice.pdf');
    
    try {
      generateInvoice(orderInfo, invoicePath);
    } catch (error) {
      console.error('Error generating invoice:', error);
      return res.status(500).send('Internal Server Error');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aliraza.techintec@gmail.com',
        pass: 'sszf prkk aqmc vslr',
      },
    });

    // Send invoice to customer
    const customerMailOptions = {
      from: 'Catering@AladdinsHouston.com',
      to: orderInfo.customer.email, // Send to customer email
      subject: 'Your Order Invoice',
      text: `Thank you for your order. Please find your invoice attached.`,
      attachments: [
        {
          filename: 'invoice.pdf',
          path: invoicePath
        }
      ]
    };

    try {
      await transporter.sendMail(customerMailOptions);
      console.log('Customer invoice email sent successfully');
    } catch (error) {
      console.error('Error sending customer email:', error);
    }

    // Send invoice to admin
    const adminMailOptions = {
      from: 'Catering@AladdinsHouston.com',
      to: 'Catering@AladdinsHouston.com', // Admin email
      subject: 'New Order Received',
      text: `A new order has been completed. Check the details...`,
      attachments: [
        {
          filename: 'invoice.pdf',
          path: invoicePath
        }
      ]
    };

    try {
      await transporter.sendMail(adminMailOptions);
      console.log('Admin email sent successfully');
    } catch (error) {
      console.error('Error sending admin email:', error);
    } finally {
      fs.unlink(invoicePath, (err) => {
        if (err) console.error('Error deleting invoice file:', err);
      });
    }
  }

  res.status(200).end();
});


app.listen(3000, () => console.log('Server running on port 3000'));
