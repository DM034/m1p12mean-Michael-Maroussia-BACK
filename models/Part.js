const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PartSchema = new Schema({
  name: String,
  description: String,
  price: { 
    type: Number, 
    min: 0 
  }
});

module.exports = mongoose.model('Part', PartSchema);
