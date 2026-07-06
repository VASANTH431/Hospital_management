const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

// Public route for announcements
router.get('/announcements', getAnnouncements);

// Protected routes
router.use(protect);

router.get('/analytics', authorize('admin', 'doctor'), getAnalytics);
router.get('/logs', authorize('admin', 'doctor'), getLogs);

router.route('/announcements')
  .post(authorize('admin'), createAnnouncement);

router.route('/announcements/:id')
  .delete(authorize('admin'), deleteAnnouncement);

router.route('/')
  .get(authorize('admin', 'doctor'), getPatients)
  .post(authorize('admin', 'doctor'), admitPatient);

router.route('/:id')
  .get(getPatientById) // Accessible to Admin, Doctor, and Patient Attender
  .put(authorize('admin', 'doctor'), updatePatient)
  .delete(authorize('admin'), deletePatient);

router.post('/:id/discharge', authorize('admin', 'doctor'), dischargePatient);

module.exports = router;
