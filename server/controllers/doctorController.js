const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Log = require('../models/Log');

// Helper to log system events
const logEvent = async (type, message, user, details = {}) => {
  try {
    await Log.create({ type, message, user, details });
  } catch (err) {
    console.error('Logging error:', err.message);
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private (Admin / Doctor)
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a doctor
// @route   POST /api/doctors
// @access  Private (Admin)
const addDoctor = async (req, res) => {
  const { name, phone, email, specialization } = req.body;

  if (!name || !phone || !email || !specialization) {
    return res.status(400).json({ message: 'Please provide name, phone, email, and specialization' });
  }

  try {
    // Check if email already exists
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    // Generate unique Doctor ID: e.g. DOC101, DOC102...
    const count = await Doctor.countDocuments();
    const generatedId = `DOC${101 + count}`;

    // Generate a readable password: e.g., name (lowercase) + random 3-digit number
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomNum = Math.floor(100 + Math.random() * 900);
    const generatedPassword = `${cleanName}${randomNum}`;

    const doctor = await Doctor.create({
      id: generatedId,
      name,
      phone,
      email,
      specialization,
      password: generatedPassword, // Schema handles hashing in pre-save
      plainPassword: generatedPassword,
    });

    await logEvent('Doctor_Add', `Doctor ${name} (${generatedId}) added to VK Hospital.`, `Admin ${req.user.username || 'System'}`);

    // Return the doctor info including raw password so Admin can share it
    res.status(201).json({
      _id: doctor._id,
      id: doctor.id,
      name: doctor.name,
      phone: doctor.phone,
      email: doctor.email,
      specialization: doctor.specialization,
      generatedPassword // Sending raw password back to display once to admin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin / Doctor)
const updateDoctor = async (req, res) => {
  const { name, phone, email, specialization, password } = req.body;

  try {
    const doctor = await Doctor.findOne({ id: req.params.id });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Allow Admin or the Doctor themselves to update profile
    if (req.user.role !== 'admin' && req.user.id !== doctor.id) {
      return res.status(403).json({ message: 'Not authorized to update this doctor' });
    }

    doctor.name = name || doctor.name;
    doctor.phone = phone || doctor.phone;
    doctor.email = email || doctor.email;
    doctor.specialization = specialization || doctor.specialization;

    if (password) {
      doctor.password = password; // Will be hashed by pre-save
    }

    const updatedDoctor = await doctor.save();
    res.json({
      _id: updatedDoctor._id,
      id: updatedDoctor.id,
      name: updatedDoctor.name,
      phone: updatedDoctor.phone,
      email: updatedDoctor.email,
      specialization: updatedDoctor.specialization,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ id: req.params.id });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await Doctor.deleteOne({ id: req.params.id });

    // Also re-assign their patients to another doctor or leave as is
    // For simplicity, we just delete the doctor. We can log this
    await logEvent('System', `Doctor ${doctor.name} (${doctor.id}) removed.`, `Admin ${req.user.username || 'System'}`);

    res.json({ message: 'Doctor removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor workload and their list of patients
// @route   GET /api/doctors/workload
// @access  Private (Admin)
const getDoctorWorkload = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    const workload = await Promise.all(doctors.map(async (doc) => {
      const patients = await Patient.find({ doctorId: doc.id, status: 'admitted' });
      return {
        id: doc.id,
        name: doc.name,
        specialization: doc.specialization,
        email: doc.email,
        phone: doc.phone,
        patientCount: patients.length,
        patients: patients
      };
    }));

    res.json(workload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorWorkload
};
