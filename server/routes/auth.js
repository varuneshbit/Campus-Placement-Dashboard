const express = require('express');
const { register, login, getMe, getStudents } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getMe);
router.get('/students', protect, authorize('admin'), getStudents);

module.exports = router;
