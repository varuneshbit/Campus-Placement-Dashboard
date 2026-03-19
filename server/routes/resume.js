const express = require('express');
const { analyzeResume } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Only students can analyze their own resumes
router.use(protect);
router.use(authorize('student'));

router.get('/analyze', analyzeResume);

module.exports = router;
