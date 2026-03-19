const express = require('express');
const { 
    getDrives, 
    createDrive, 
    updateDrive, 
    applyForDrive,
    getApplicants
} = require('../controllers/driveController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getDrives)
    .post(authorize('admin'), createDrive);

router.route('/:id')
    .put(authorize('admin'), updateDrive);

router.post('/:id/apply', authorize('student'), applyForDrive);
router.get('/:id/applicants', authorize('admin'), getApplicants);

module.exports = router;
