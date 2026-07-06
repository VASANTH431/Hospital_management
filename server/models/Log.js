const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Admission', 'Discharge', 'Bed_Update', 'Doctor_Add', 'System']
  },
  message: {
    type: String,
    required: true
  },
  user: {
    type: String, // e.g. "Admin Vasanth", "Doctor DOC001"
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);
