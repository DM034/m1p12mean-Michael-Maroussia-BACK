const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    customerName: { type: String, required: false }, 
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true }, 
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true }, 
    serviceType: { type: String, required: true }, 
    carModel: { type: String, required: true }, 
    licensePlate: { type: String, required: true }, 
    appointmentDate: { type: Date, required: true }, 
    status: { 
        type: String, 
        enum: ['pending', 'scheduled', 'in-progress', 'completed', 'canceled'], 
        default: 'pending' 
    },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
