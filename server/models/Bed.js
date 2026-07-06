const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  bedNumber: {
    type: String,
    required: true
  },
  floor: {
    type: String,
    required: true,
    enum: ['Ground', 'First', 'Second', 'Third', 'ICU', 'Emergency', 'VIP', 'General Ward']
  },
  ward: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'],
    default: 'Available'
  },
  patientId: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Bed', bedSchema);
