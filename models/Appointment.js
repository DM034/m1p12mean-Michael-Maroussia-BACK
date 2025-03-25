const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    user: { type: String, required: true },
    customerName: { type: String, required: false }, 
    vehicleId: { type: String, required: true }, 
    serviceId: { type: String, required: true }, 
    serviceType: { type: String, required: true }, 
    carModel: { type: String, required: true }, 
    licensePlate: { type: String, required: true }, 
    appointmentDate: { type: Date, required: true }, 
    status: { 
        type: String, 
        enum: ['pending', 'scheduled', 'in-progress', 'completed', 'canceled'], 
        default: 'pending' 
    },
    assignedMechanics: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
