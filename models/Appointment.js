const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  mechanics: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],
  startTime: {
    type: Date,
    index: true
  },
  endTime: {
    type: Date,
    index: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'validated', 'in_progress', 'completed', 'canceled'],
    default: 'scheduled',
    index: true
  },
  services: [{
    serviceType: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    estimatedDuration: Number,
    estimatedCost: Number
  }],
  totalEstimatedCost: Number,

  partsUsed: [{
    part: {
      type: Schema.Types.ObjectId,
      ref: 'Part',
      required: true
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1
    },
    unitPrice: {
      type: Number,
      min: 0
    },
    totalPrice: {
      type: Number,
      min: 0
    }
  }],

  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
