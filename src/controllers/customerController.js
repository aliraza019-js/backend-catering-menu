const Customer = require('../models/Customer');

exports.getAllCustomers = async (req, res) => {
  try {
    // Set default pagination values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    console.time("Fetching Customers");
    
    // Optimize query with pagination and lean()
    const customers = await Customer.find()
      .populate('orders')  // Consider removing or optimizing if orders are large
      .limit(limit)
      .skip((page - 1) * limit)
      .lean(); // Use lean() to improve performance by returning plain objects
    
    console.timeEnd("Fetching Customers");

    // Return paginated customers
    return res.status(200).json(customers);
  } catch (err) {
    console.error("Error fetching customers:", err); // Log error details for debugging
    return res.status(500).json({ error: err.message });
  }
};
