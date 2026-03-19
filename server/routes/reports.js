const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { exportStudentReport, exportCompanyReport, exportDriveReport } = require('../controllers/reportController');

// Only admins can generate these reports
router.use(protect);
router.use(authorize('admin'));

router.get('/students', exportStudentReport);
router.get('/companies', exportCompanyReport);
router.get('/drives', exportDriveReport);

module.exports = router;
