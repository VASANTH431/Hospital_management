const mongoose = require('mongoose');

const surgerySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    patientId: {
        type: String, // ID of the patient
        required: true
    },
    doctorId: {
        type: String, // ID of the doctor performing it
        required: true
    },
    surgeryName: {
        type: String,
        required: true
    },
    surgeryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    operationTheater: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    estimatedAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Surgery', surgerySchema);
