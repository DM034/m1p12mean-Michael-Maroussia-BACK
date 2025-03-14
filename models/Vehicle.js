const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Propriétaire du véhicule
    brand: { type: String, required: true }, // Marque (ex: Toyota)
    model: { type: String, required: true }, // Modèle (ex: Corolla)
    year: { type: Number, required: true }, // Année de fabrication
    licensePlate: { type: String, required: true, unique: true }, // Immatriculation (ex: AB-123-CD)
    createdAt: { type: Date, default: Date.now } // Date d'ajout du véhicule
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
