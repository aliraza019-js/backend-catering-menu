require('dotenv').config(); // Add this line to load the .env file
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: process.env.APP_ENV })); // Adjust the origin as per your frontend's URL


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

  app.post("/create-checkout-session", async (req, res) => {
    const { items, tipAmount, tax } = req.body;
  
    const line_items = items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents and round
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
          unit_amount: Math.round(tipAmount * 100), // Convert to cents and round
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
          unit_amount: Math.round(tax * 100), // Convert to cents and round
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

app.listen(3000, () => console.log('Server running on port 3000'));
