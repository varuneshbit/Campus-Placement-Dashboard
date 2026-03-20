const express = require('express');
const { analyzeResume } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

const router = express.Router();

// Only students can analyze their own resumes
router.use(protect);
router.use(authorize('student'));

router.post('/analyze', uploadResume, analyzeResume);

module.exports = router;
