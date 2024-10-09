const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  phone: {
    type: String,
    required: true,
  },
  orders: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  }],
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
