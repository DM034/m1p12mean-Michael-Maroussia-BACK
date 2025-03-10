const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
    description: { type: String, required: true }, 
    price: { type: Number, required: true }, 
    estimatedDuration: { type: Number, required: true }, 
    isAvailable: { type: Boolean, default: true } 
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
