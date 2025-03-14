const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Client qui fait le devis
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true }, // Véhicule concerné
    services: [
        {
            service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
            quantity: { type: Number, default: 1 }
        }
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Quote", quoteSchema);
