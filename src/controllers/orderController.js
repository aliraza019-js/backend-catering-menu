const OrderDetails = require('../models/Order');
const Customer = require('../models/Customer');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await OrderDetails.find();
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

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
    if (deliveryMethod === 'delivery' && !deliveryDetails.address) {
      return res.status(400).json({ error: 'Delivery address is required for delivery orders.' });
    }

    const totalItemsAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalAmount = totalItemsAmount + (tip || 0) + (tax || 0);
    
    const customerData = deliveryMethod === 'delivery' 
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
      let customer = await Customer.findOne({ email: customerData.email });
      if (!customer) {
        customer = new Customer({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          orders: [],
        });
      }
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
    customer.orders.push(newOrder._id);
    await customer.save();

    return res.status(201).json({
      message: 'Order successfully saved',
      orderId: newOrder._id,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
