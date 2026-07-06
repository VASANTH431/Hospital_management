const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  disease: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  estimatedDischargeDate: {
    type: Date,
    required: true
  },
  bedId: {
    type: String, // References Bed's unique ID
    required: true
  },
  floor: {
    type: String,
    required: true
  },
  ward: {
    type: String,
    required: true
  },
  foodPlan: {
    type: String,
    required: true
  },
  medicinePlan: {
    type: String,
    required: true
  },
  allergies: {
    type: String,
    default: 'None'
  },
  nextCheckupDate: {
    type: Date,
    required: true
  },
  emergencyContact: {
    type: String,
    required: true
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  doctorId: {
    type: String, // References Doctor's ID (e.g., DOC001)
    required: true
  },
  status: {
    type: String,
    enum: ['admitted', 'discharged'],
    default: 'admitted'
  },
  billingStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Pending'],
    default: 'Unpaid'
  },
  recoveryProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 20
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
