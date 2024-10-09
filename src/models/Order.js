const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  items: {type:Array,required:true},
  totalAmount: { type: Number, required: true },
  tip: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  numberOfGuests: Number,

  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true,
  },

  deliveryDetails: {
    firstname: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'delivery';
      },
    },
    lastname: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'delivery';
      },
    },
    businessname: String,
    email: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'delivery';
      },
    },
    phonenumber: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'delivery';
      },
    },
    address: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'delivery';
      },
    },
    address2: String, 
    city: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'delivery';
      },
    },
    state: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'delivery';
      },
    },
    zipcode: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'delivery';
      },
    },
    deliveryTime: String,
    location: String, 
  },

  pickupDetails: {
    firstname: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'pickup';
      },
    },
    lastname: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'pickup';
      },
    },
    businessname: String, 
    email: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'pickup';
      },
    },
    phonenumber: {
      type: String,
      required: function () {
        return this.deliveryMethod === 'pickup';
      },
    },
    pickupTime: String,
    location: String,
  },

  status: { type: String, default: 'Pending' },

  createdAt: { type: Date, default: Date.now },
});

const OrderDetails = mongoose.model('Order', orderDetailSchema);

module.exports = OrderDetails;