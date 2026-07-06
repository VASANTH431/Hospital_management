const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth admin/doctor/attender & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { username, password, patientId, role } = req.body;

  try {
    if (role === 'admin') {
      const admin = await Admin.findOne({ username });
      if (admin && (await admin.comparePassword(password))) {
        res.json({
          _id: admin._id,
          username: admin.username,
          role: 'admin',
          token: generateToken(admin._id, 'admin'),
        });
      } else {
        res.status(401).json({ message: 'Invalid admin username or password' });
      }
    } else if (role === 'doctor') {
      const doctor = await Doctor.findOne({ id: username }); // username field is used as Doctor ID
      if (doctor && (await doctor.comparePassword(password))) {
        res.json({
          _id: doctor._id,
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.specialization,
          role: 'doctor',
          token: generateToken(doctor.id, 'doctor'),
        });
      } else {
        res.status(401).json({ message: 'Invalid Doctor ID or password' });
      }
    } else if (role === 'attender') {
      const patient = await Patient.findOne({ id: patientId });
      if (patient) {
        res.json({
          _id: patient._id,
          id: patient.id,
          name: patient.name,
          role: 'attender',
          token: generateToken(patient.id, 'attender'),
        });
      } else {
        res.status(401).json({ message: 'Invalid Patient ID. Patient not found' });
      }
    } else {
      res.status(400).json({ message: 'Invalid login role specified' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      res.json({
        _id: req.user._id,
        username: req.user.username,
        role: 'admin'
      });
    } else if (req.user.role === 'doctor') {
      res.json({
        _id: req.user._id,
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        specialization: req.user.specialization,
        role: 'doctor'
      });
    } else if (req.user.role === 'attender') {
      const patient = await Patient.findOne({ id: req.user.id });
      if (patient) {
        res.json({
          id: patient.id,
          name: patient.name,
          role: 'attender',
          patient
        });
      } else {
        res.status(404).json({ message: 'Patient profile not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, getMe };
