const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvoiceSchema = new Schema({
  appointmentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Appointment', 
    required: true, 
    index: true 
  },
  clientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  invoiceNumber: { 
    type: String, 
    unique: true 
  },
  items: [{
    type: { 
      type: String, 
      enum: ['service', 'part'] 
    },
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: Number,
  taxRate: Number,
  totalAmount: Number,
  status: {
    type: String,
    enum: ['issued', 'paid', 'overdue'],
    default: 'issued',
    index: true
  }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
