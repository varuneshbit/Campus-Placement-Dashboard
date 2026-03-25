const express = require('express');
const {
  scheduleInterview,
  updateInterview,
  deleteInterview,
  getStudentInterviews,
  getAllInterviews,
  bulkCreateInterviews,
  importInterviews
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');
const { uploadExcel } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getAllInterviews);
router.post('/bulk', authorize('admin'), bulkCreateInterviews);
router.post('/import-excel', authorize('admin'), uploadExcel, importInterviews);
router.post('/', authorize('admin'), scheduleInterview);
router.put('/:id', authorize('admin'), updateInterview);
router.delete('/:id', authorize('admin'), deleteInterview);
router.get('/student', authorize('student'), getStudentInterviews);

module.exports = router;
