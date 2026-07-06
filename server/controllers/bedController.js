const Bed = require('../models/Bed');
const Log = require('../models/Log');

// Helper to log system events
const logEvent = async (type, message, user, details = {}) => {
  try {
    await Log.create({ type, message, user, details });
  } catch (err) {
    console.error('Logging error:', err.message);
  }
};

// @desc    Get all beds
// @route   GET /api/beds
// @access  Private (Admin / Doctor / Attender)
const getBeds = async (req, res) => {
  try {
    const beds = await Bed.find({});
    res.json(beds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a bed's status manually
// @route   PUT /api/beds/:id/status
// @access  Private (Admin / Doctor)
const updateBedStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid bed status' });
  }

  try {
    const bed = await Bed.findOne({ id: req.params.id });

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    const oldStatus = bed.status;
    bed.status = status;

    // If changing to Available, clean patient reference
    if (status === 'Available') {
      bed.patientId = null;
    }

    const updatedBed = await bed.save();

    const username = req.user.role === 'admin' ? `Admin ${req.user.username}` : `Doctor ${req.user.name}`;
    await logEvent('Bed_Update', `Bed ${bed.bedNumber} (${bed.floor}) status changed from ${oldStatus} to ${status}.`, username);

    // Emit live WebSocket update using the req.io object attached in server.js
    if (req.io) {
      req.io.emit('bed_update', updatedBed);
      req.io.emit('new_activity', {
        type: 'Bed_Update',
        message: `Bed ${bed.bedNumber} (${bed.floor}) updated to ${status}.`,
        user: username,
        createdAt: new Date()
      });
    }

    res.json(updatedBed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bed occupancy statistics
// @route   GET /api/beds/stats
// @access  Private (Admin / Doctor)
const getBedStats = async (req, res) => {
  try {
    const beds = await Bed.find({});
    const total = beds.length;
    const occupied = beds.filter(b => b.status === 'Occupied').length;
    const available = beds.filter(b => b.status === 'Available').length;
    const reserved = beds.filter(b => b.status === 'Reserved').length;
    const cleaning = beds.filter(b => b.status === 'Cleaning').length;
    const maintenance = beds.filter(b => b.status === 'Maintenance').length;

    // Bed counts per floor
    const floors = ['Ground', 'First', 'Second', 'Third', 'ICU', 'Emergency', 'VIP', 'General Ward'];
    const floorStats = floors.map(floorName => {
      const floorBeds = beds.filter(b => b.floor === floorName);
      const floorTotal = floorBeds.length;
      const floorOccupied = floorBeds.filter(b => b.status === 'Occupied').length;
      const floorAvailable = floorBeds.filter(b => b.status === 'Available').length;
      const floorCleaning = floorBeds.filter(b => b.status === 'Cleaning').length;
      const floorReserved = floorBeds.filter(b => b.status === 'Reserved').length;
      const floorMaintenance = floorBeds.filter(b => b.status === 'Maintenance').length;

      return {
        floor: floorName,
        total: floorTotal,
        occupied: floorOccupied,
        available: floorAvailable,
        cleaning: floorCleaning,
        reserved: floorReserved,
        maintenance: floorMaintenance,
        occupancyRate: floorTotal > 0 ? Math.round((floorOccupied / floorTotal) * 100) : 0
      };
    });

    res.json({
      summary: { total, occupied, available, reserved, cleaning, maintenance },
      floors: floorStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBeds,
  updateBedStatus,
  getBedStats
};
