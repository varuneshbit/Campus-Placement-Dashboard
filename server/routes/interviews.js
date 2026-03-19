const express = require('express');
const { 
  scheduleInterview, 
  updateInterview, 
  getStudentInterviews,
  getAllInterviews 
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getAllInterviews);
router.post('/', authorize('admin'), scheduleInterview);
router.put('/:id', authorize('admin'), updateInterview);
router.get('/student', authorize('student'), getStudentInterviews);

module.exports = router;
