const express = require('express');
const router = express.Router();
const {
    bookSurgery,
    getSurgeries,
    updateSurgery
} = require('../controllers/surgeryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(authorize('admin', 'doctor'), getSurgeries)
    .post(authorize('admin', 'doctor'), bookSurgery);

router.route('/:id')
    .put(authorize('admin', 'doctor'), updateSurgery);

module.exports = router;
