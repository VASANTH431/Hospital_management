const express = require('express');
const router = express.Router();
const { getBeds, updateBedStatus, getBedStats } = require('../controllers/bedController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getBeds);
router.get('/stats', authorize('admin', 'doctor'), getBedStats);
router.put('/:id/status', authorize('admin', 'doctor'), updateBedStatus);

module.exports = router;
