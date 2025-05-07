const express = require('express');
const router = express.Router();

// Import the event controller
const { getAllEvents } = require('../controllers/eventController');

// Route to get all events
router.get('/', getAllEvents);

module.exports = router;
