const express = require('express');
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getEvents);
router.post('/', protect, authorize('admin'), createEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

module.exports = router;
