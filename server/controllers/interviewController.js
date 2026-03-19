const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Schedule new interview
// @route   POST /api/interviews
exports.scheduleInterview = async (req, res) => {
  try {
    const interview = await Interview.create(req.body);

    // Notify student
    await Notification.create({
      user: interview.studentId,
      title: 'Interview Scheduled',
      message: `You have an interview scheduled for round: ${interview.round} on ${new Date(interview.interviewDate).toLocaleDateString()}`,
      type: 'interview',
      link: '/student/interviews'
    });

    res.status(201).json({ success: true, data: interview });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update interview/result
// @route   PUT /api/interviews/:id
exports.updateInterview = async (req, res) => {
  try {
    let interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const { status, result } = req.body;
    
    const oldResult = interview.result;
    interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Notify if result is announced
    if (result && result !== 'pending' && result !== oldResult) {
      await Notification.create({
        user: interview.studentId,
        title: 'Interview Result Announced',
        message: `Your result for the interview round ${interview.round} is: ${result.toUpperCase()}`,
        type: 'result',
        link: '/student/results'
      });
    }

    res.status(200).json({ success: true, data: interview });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all interviews for student
// @route   GET /api/interviews/student
exports.getStudentInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ studentId: req.user.id })
      .populate('driveId', 'driveName')
      .sort('interviewDate');

    res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// @desc    Get all interviews for admin
// @route   GET /api/interviews
exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('driveId', 'driveName')
      .populate('studentId', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
