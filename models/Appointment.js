const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    customerName: { type: String, required: true }, // Nom du client
    carModel: { type: String, required: true }, // Modèle de la voiture
    licensePlate: { type: String, required: true, unique: true }, // Plaque d'immatriculation
    serviceType: { type: String, required: true }, // Type de service
    appointmentDate: { type: Date, required: true }, // Date du RDV
    status: { 
        type: String, 
        enum: ['pending', 'scheduled', 'in-progress', 'completed', 'canceled'], 
        default: 'pending' 
    } // Statut du RDV
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
