const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const Doctor = require('../models/Doctor');
const Log = require('../models/Log');
const Announcement = require('../models/Announcement');

// Helper to log system events
const logEvent = async (type, message, user, details = {}) => {
  try {
    await Log.create({ type, message, user, details });
  } catch (err) {
    console.error('Logging error:', err.message);
  }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Admin / Doctor)
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({}).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private (Admin / Doctor / Attender)
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Fetch doctor details
    const doctor = await Doctor.findOne({ id: patient.doctorId }).select('-password');

    res.json({
      patient,
      doctor: doctor || { name: 'Unassigned', specialization: 'N/A' }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admit/Add a Patient
// @route   POST /api/patients
// @access  Private (Doctor / Admin)
const admitPatient = async (req, res) => {
  const {
    name, age, gender, disease, diagnosis, bloodGroup,
    estimatedDischargeDate, bedId, floor, ward,
    foodPlan, medicinePlan, allergies, nextCheckupDate,
    emergencyContact, specialInstructions, doctorId
  } = req.body;

  if (!name || !age || !gender || !disease || !diagnosis || !bloodGroup || 
      !estimatedDischargeDate || !bedId || !floor || !ward || 
      !foodPlan || !medicinePlan || !nextCheckupDate || !emergencyContact) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    // Check if the bed exists and is available
    const bed = await Bed.findOne({ id: bedId });
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }
    if (bed.status !== 'Available') {
      return res.status(400).json({ message: 'Bed is not available (Status: ' + bed.status + ')' });
    }

    // Auto-generate Patient ID: PAT + random 5-digit number
    let uniqueId = '';
    let exists = true;
    while (exists) {
      const rand = Math.floor(10000 + Math.random() * 90000);
      uniqueId = `PAT${rand}`;
      const patientExists = await Patient.findOne({ id: uniqueId });
      if (!patientExists) exists = false;
    }

    // Determine who admitted the patient
    const assignedDoctorId = doctorId || (req.user.role === 'doctor' ? req.user.id : null);
    if (!assignedDoctorId) {
      return res.status(400).json({ message: 'Please assign a Doctor ID' });
    }

    const patient = await Patient.create({
      id: uniqueId,
      name,
      age: Number(age),
      gender,
      disease,
      diagnosis,
      bloodGroup,
      estimatedDischargeDate,
      bedId,
      floor,
      ward,
      foodPlan,
      medicinePlan,
      allergies: allergies || 'None',
      nextCheckupDate,
      emergencyContact,
      specialInstructions: specialInstructions || '',
      doctorId: assignedDoctorId,
      status: 'admitted',
      billingStatus: 'Unpaid',
      recoveryProgress: 10
    });

    // Update Bed status to Occupied and associate with Patient ID
    bed.status = 'Occupied';
    bed.patientId = uniqueId;
    await bed.save();

    const actor = req.user.role === 'admin' ? `Admin ${req.user.username}` : `Doctor ${req.user.name}`;
    await logEvent('Admission', `Patient ${name} (${uniqueId}) admitted to Bed ${bed.bedNumber} (${floor} floor).`, actor);

    // Emit live updates
    if (req.io) {
      req.io.emit('bed_update', bed);
      req.io.emit('new_activity', {
        type: 'Admission',
        message: `Patient ${name} admitted to Bed ${bed.bedNumber}.`,
        user: actor,
        createdAt: new Date()
      });
    }

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Patient Details
// @route   PUT /api/patients/:id
// @access  Private (Doctor / Admin)
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update fields
    const fieldsToUpdate = [
      'name', 'age', 'gender', 'disease', 'diagnosis', 'bloodGroup',
      'estimatedDischargeDate', 'foodPlan', 'medicinePlan', 'allergies',
      'nextCheckupDate', 'emergencyContact', 'specialInstructions',
      'doctorId', 'billingStatus', 'recoveryProgress'
    ];

    let bedChanged = false;
    let oldBedId = patient.bedId;
    let newBedId = req.body.bedId;

    if (newBedId && newBedId !== oldBedId) {
      // Check if new bed is available
      const newBed = await Bed.findOne({ id: newBedId });
      if (!newBed || newBed.status !== 'Available') {
        return res.status(400).json({ message: 'New bed is not available' });
      }
      bedChanged = true;
    }

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    });

    if (bedChanged) {
      // Free old bed
      const oldBed = await Bed.findOne({ id: oldBedId });
      if (oldBed) {
        oldBed.status = 'Cleaning'; // Hospital procedure
        oldBed.patientId = null;
        await oldBed.save();
        if (req.io) req.io.emit('bed_update', oldBed);
      }

      // Occupy new bed
      const newBed = await Bed.findOne({ id: newBedId });
      newBed.status = 'Occupied';
      newBed.patientId = patient.id;
      await newBed.save();
      if (req.io) req.io.emit('bed_update', newBed);

      patient.bedId = newBedId;
      patient.floor = newBed.floor;
      patient.ward = newBed.ward;
    }

    const updatedPatient = await patient.save();
    const actor = req.user.role === 'admin' ? `Admin ${req.user.username}` : `Doctor ${req.user.name}`;
    
    await logEvent('System', `Patient ${patient.name} (${patient.id}) details updated.`, actor);
    
    if (req.io) {
      req.io.emit('patient_update', updatedPatient);
      req.io.emit('new_activity', {
        type: 'System',
        message: `Patient ${patient.name} details updated.`,
        user: actor,
        createdAt: new Date()
      });
    }

    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Discharge Patient
// @route   POST /api/patients/:id/discharge
// @access  Private (Doctor / Admin)
const dischargePatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (patient.status === 'discharged') {
      return res.status(400).json({ message: 'Patient is already discharged' });
    }

    // Set status to discharged
    patient.status = 'discharged';
    patient.recoveryProgress = 100;
    await patient.save();

    // Release bed to Cleaning
    const bed = await Bed.findOne({ id: patient.bedId });
    if (bed) {
      bed.status = 'Cleaning';
      bed.patientId = null;
      await bed.save();
      if (req.io) req.io.emit('bed_update', bed);
    }

    const actor = req.user.role === 'admin' ? `Admin ${req.user.username}` : `Doctor ${req.user.name}`;
    await logEvent('Discharge', `Patient ${patient.name} (${patient.id}) discharged from Bed ${bed ? bed.bedNumber : 'N/A'}.`, actor);

    if (req.io) {
      req.io.emit('new_activity', {
        type: 'Discharge',
        message: `Patient ${patient.name} discharged. Bed ${bed ? bed.bedNumber : 'N/A'} is now in Cleaning.`,
        user: actor,
        createdAt: new Date()
      });
    }

    res.json({ message: 'Patient discharged successfully', patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin)
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // If patient is still admitted, free their bed
    if (patient.status === 'admitted') {
      const bed = await Bed.findOne({ id: patient.bedId });
      if (bed) {
        bed.status = 'Available';
        bed.patientId = null;
        await bed.save();
        if (req.io) req.io.emit('bed_update', bed);
      }
    }

    await Patient.deleteOne({ id: req.params.id });

    const actor = `Admin ${req.user.username}`;
    await logEvent('System', `Patient record of ${patient.name} (${patient.id}) deleted.`, actor);

    res.json({ message: 'Patient record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics & analytics
// @route   GET /api/patients/analytics
// @access  Private (Admin / Doctor)
const getAnalytics = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments({});
    const totalPatients = await Patient.countDocuments({});
    const admittedPatients = await Patient.countDocuments({ status: 'admitted' });
    const dischargedPatients = await Patient.countDocuments({ status: 'discharged' });

    const beds = await Bed.find({});
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
    const availableBeds = beds.filter(b => b.status === 'Available').length;
    const cleaningBeds = beds.filter(b => b.status === 'Cleaning').length;
    const maintenanceBeds = beds.filter(b => b.status === 'Maintenance').length;
    const reservedBeds = beds.filter(b => b.status === 'Reserved').length;

    // Floor occupancy rates
    const floors = ['Ground', 'First', 'Second', 'Third', 'ICU', 'Emergency', 'VIP', 'General Ward'];
    const floorOccupancy = floors.map(floorName => {
      const floorBeds = beds.filter(b => b.floor === floorName);
      const occupied = floorBeds.filter(b => b.status === 'Occupied').length;
      return {
        floor: floorName,
        total: floorBeds.length,
        occupied,
        occupancyRate: floorBeds.length > 0 ? Math.round((occupied / floorBeds.length) * 100) : 0
      };
    });

    // Patient admission trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Group admissions by date in memory (for development or simple MongoDB aggregation)
    const recentPatients = await Patient.find({ admissionDate: { $gte: sevenDaysAgo } });
    const admissionTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = recentPatients.filter(p => {
        const pDate = new Date(p.admissionDate);
        return pDate.getDate() === date.getDate() && pDate.getMonth() === date.getMonth();
      }).length;
      admissionTrends.push({ name: dateStr, Admissions: count });
    }

    res.json({
      counters: {
        doctors: totalDoctors,
        patients: totalPatients,
        admitted: admittedPatients,
        discharged: dischargedPatients,
        totalBeds,
        occupiedBeds,
        availableBeds,
        cleaningBeds,
        maintenanceBeds,
        reservedBeds
      },
      floorOccupancy,
      admissionTrends
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent activity logs
// @route   GET /api/patients/logs
// @access  Private (Admin / Doctor)
const getLogs = async (req, res) => {
  try {
    const logs = await Log.find({}).sort({ createdAt: -1 }).limit(30);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Announcements
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Announcement
// @route   POST /api/announcements
// @access  Private (Admin)
const createAnnouncement = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and Content are required' });
  }
  try {
    const ann = await Announcement.create({ title, content });
    
    if (req.io) {
      req.io.emit('new_announcement', ann);
    }
    
    await logEvent('System', `Announcement posted: "${title}"`, `Admin ${req.user.username}`);
    res.status(201).json(ann);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  admitPatient,
  updatePatient,
  dischargePatient,
  deletePatient,
  getAnalytics,
  getLogs,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
