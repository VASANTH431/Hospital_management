const express = require('express');
const router = express.Router();
const {
  getDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorWorkload
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getDoctors)
  .post(authorize('admin'), addDoctor);

router.route('/workload')
  .get(authorize('admin'), getDoctorWorkload);

router.route('/:id')
  .put(updateDoctor)
  .delete(authorize('admin'), deleteDoctor);

module.exports = router;
