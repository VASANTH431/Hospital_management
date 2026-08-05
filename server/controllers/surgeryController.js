const Surgery = require('../models/Surgery');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Log = require('../models/Log');

const logEvent = async (type, message, user, details = {}) => {
    try {
        await Log.create({ type, message, user, details });
    } catch (err) {
        console.error('Logging error:', err.message);
    }
};

// @desc    Create a surgery booking
// @route   POST /api/surgeries
// @access  Private (Admin / Doctor)
const bookSurgery = async (req, res) => {
    const { patientId, doctorId, surgeryName, surgeryDate, operationTheater, notes } = req.body;

    if (!patientId || !doctorId || !surgeryName || !surgeryDate || !operationTheater) {
        return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    try {
        // Validation Checks
        const patient = await Patient.findOne({ id: patientId });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const doctor = await Doctor.findOne({ id: doctorId });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        // Auto-generate Surgery ID (e.g. SURGXXXXX)
        let uniqueId = '';
        let exists = true;
        while (exists) {
            const rand = Math.floor(10000 + Math.random() * 90000);
            uniqueId = `SURG${rand}`;
            const surgeryExists = await Surgery.findOne({ id: uniqueId });
            if (!surgeryExists) exists = false;
        }

        const surgery = await Surgery.create({
            id: uniqueId,
            patientId,
            doctorId,
            surgeryName,
            surgeryDate,
            operationTheater,
            notes: notes || '',
            status: 'Scheduled'
        });

        const actor = req.user.role === 'admin' ? `Admin ${req.user.username}` : `Doctor ${req.user.name}`;
        await logEvent('Surgery', `Surgery ${surgeryName} booked for Patient ${patient.name} (${patientId}).`, actor);

        if (req.io) {
            req.io.emit('surgery_update', surgery);
            req.io.emit('new_activity', {
                type: 'Surgery',
                message: `Surgery ${surgeryName} booked for Patient ${patient.name}.`,
                user: actor,
                createdAt: new Date()
            });
        }

        res.status(201).json(surgery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all surgeries (Admin/Doctor)
// @route   GET /api/surgeries
// @access  Private (Admin / Doctor)
const getSurgeries = async (req, res) => {
    try {
        // Optionally filter by doctor if needed, but returning all is okay for dashboard initially
        let query = {};
        if (req.user.role === 'doctor') {
            query.doctorId = req.user.id;
        }
        const surgeries = await Surgery.find(query).sort({ surgeryDate: 1 });
        res.json(surgeries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update surgery details/status
// @route   PUT /api/surgeries/:id
// @access  Private (Admin / Doctor)
const updateSurgery = async (req, res) => {
    try {
        const surgery = await Surgery.findOne({ id: req.params.id });
        if (!surgery) return res.status(404).json({ message: 'Surgery not found' });

        const fieldsToUpdate = ['surgeryName', 'surgeryDate', 'operationTheater', 'status', 'notes'];
        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                surgery[field] = req.body[field];
            }
        });

        const updatedSurgery = await surgery.save();

        const actor = req.user.role === 'admin' ? `Admin ${req.user.username}` : `Doctor ${req.user.name}`;
        await logEvent('Surgery', `Surgery ${surgery.id} updated.`, actor);

        if (req.io) {
            req.io.emit('surgery_update', updatedSurgery);
        }

        res.json(updatedSurgery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    bookSurgery,
    getSurgeries,
    updateSurgery
};
