const Student = require('../models/Student');
const path = require('path');
const fs = require('fs');

// @desc    Upload or Update resume
// @route   POST /api/students/resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    let student = await Student.findOne({ user: req.user.id });
    
    // If student profile doesn't exist, create a basic one
    if (!student) {
        student = await Student.create({
            user: req.user.id,
            rollNumber: `TEMP-${Date.now()}`,
            batch: '2024',
            branch: 'General',
            cgpa: 0
        });
    }

    // Delete old resume if it exists
    if (student.resumeURL) {
      const oldPath = path.join(__dirname, '..', student.resumeURL);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    student.resumeURL = `/uploads/resumes/${req.file.filename}`;
    await student.save();

    res.status(200).json({
      success: true,
      data: student.resumeURL
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get student profile including resume
// @route   GET /api/students/profile
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
