const express = require('express');
const {
  uploadResume,
  getStudentProfile,
  updateProfile,
  uploadImage,
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getStudents,
  addStudent,
  bulkUploadStudents,
  exportStudents,
  blockStudent,
  unblockStudent,
  updatePlacementStatus,
  deleteStudent,
  getEligibleStudents
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume: uploadResumeMiddleware, uploadImage: uploadImageMiddleware, uploadExcel } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/profile', authorize('student'), getStudentProfile);
router.put('/profile/update', authorize('student'), updateProfile);
router.post('/profile/upload-resume', authorize('student'), uploadResumeMiddleware, uploadResume);
router.post('/profile/upload-image', authorize('student'), uploadImageMiddleware, uploadImage);

// Project specific routes
router.get('/profile/projects', authorize('student'), getProjects);
router.post('/profile/projects', authorize('student'), addProject);
router.put('/profile/projects/:id', authorize('student'), updateProject);
router.delete('/profile/projects/:id', authorize('student'), deleteProject);

// Admin routes
router.get('/', authorize('admin'), getStudents);
router.post('/', authorize('admin'), addStudent);
router.get('/eligible', authorize('admin'), getEligibleStudents);
router.post('/bulk-upload', authorize('admin'), uploadExcel, bulkUploadStudents);
router.get('/export', authorize('admin'), exportStudents);
router.put('/:id/block', authorize('admin'), blockStudent);
router.put('/:id/unblock', authorize('admin'), unblockStudent);
router.put('/:id/status', authorize('admin'), updatePlacementStatus);
router.delete('/:id', authorize('admin'), deleteStudent);

module.exports = router;
