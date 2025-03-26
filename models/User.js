const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { 
    type: String, 
    unique: true, 
    required: true, 
    index: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'mechanic', 'admin'], 
    required: true, 
    default: 'user' 
  },
  profile: {
    firstName: String,
    lastName: String,
    phoneNumber: String
  },
  specialties: [{ 
    type: String, 
    index: true 
  }],
  hourlyRate: Number,
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  lastLogin: Date,
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

module.exports = mongoose.model('User', UserSchema);
