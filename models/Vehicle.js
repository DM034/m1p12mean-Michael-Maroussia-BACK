const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VehicleSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  make: String,
  model: String,
  year: { 
    type: Number, 
    min: 1900 
  },
  licensePlate: { 
    type: String, 
    unique: true, 
    index: true 
  },
  technicalDetails: {
    mileage: Number,
    fuelType: String,
    lastMaintenanceDate: Date
  },
  maintenanceHistory: [{
    date: Date,
    serviceType: String,
    description: String,
    mechanicId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    partsUsed: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Part' 
    }]
  }]
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
