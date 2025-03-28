const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceTypeSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: String,
  defaultDuration: Number,
  requiredSpecialties: [String],
  baseCost: Number
});

module.exports = mongoose.model('Service', ServiceTypeSchema);
