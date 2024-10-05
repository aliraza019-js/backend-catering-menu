// controllers/OrderController.js
const OrderDetails = require('../models/Order');

exports.saveOrder = async (req, res) => {
  const {
    items,
    tip,
    tax,
    totalAmount,
    numberOfGuests,
    deliveryMethod,
    deliveryDetails,
    pickupDetails,
  } = req.body;

  try {
    console.log('delivery method is',deliveryMethod)
    if (deliveryMethod === 'delivery' && !deliveryDetails.address) {
      return res.status(400).json({ error: 'Delivery address is required for delivery orders.' });
    }

    const totalItemsAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalAmount = totalItemsAmount + (tip || 0) + (tax || 0);
    const customer = deliveryMethod === 'delivery' 
    ? {
        name: `${deliveryDetails.firstname} ${deliveryDetails.lastname}`,
        email: deliveryDetails.email,
        phone: deliveryDetails.phonenumber,
      }
    : {
        name: `${pickupDetails.firstname} ${pickupDetails.lastname}`,
        email: pickupDetails.email,
        phone: pickupDetails.phonenumber,
      };
    const newOrder = new OrderDetails({
      customer:customer,
      items,
      totalAmount: finalAmount,
      tip,
      tax,
      numberOfGuests,
      deliveryMethod,
      deliveryDetails: deliveryMethod === 'delivery' ? deliveryDetails : undefined,
      pickupDetails: deliveryMethod === 'pickup' ? pickupDetails : undefined,
    });

    await newOrder.save();

    return res.status(201).json({
      message: 'Order successfully saved',
      orderId: newOrder._id,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
