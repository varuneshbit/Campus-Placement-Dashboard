const express = require('express');
const { uploadResume, getStudentProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/profile', authorize('student'), getStudentProfile);
router.post('/resume', authorize('student'), upload, uploadResume);

module.exports = router;
