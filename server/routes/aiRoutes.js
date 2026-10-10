const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// POST /api/ai/chat — Role-aware AI chat (requires authentication)
router.post('/chat', protect, chat);

module.exports = router;
