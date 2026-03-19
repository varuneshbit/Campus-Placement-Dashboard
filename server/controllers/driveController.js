const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all placement drives
// @route   GET /api/drives
exports.getDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find().populate('companyId', 'companyName location');
    res.status(200).json({ success: true, count: drives.length, data: drives });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new placement drive
// @route   POST /api/drives
exports.createDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.create(req.body);

    // Notify all students
    const students = await User.find({ role: 'student' });
    const notifications = students.map(student => ({
      user: student._id,
      title: 'New Placement Drive',
      message: `A new placement drive for ${req.body.driveName} has been created. Check eligibility now!`,
      type: 'drive',
      link: '/student/dashboard'
    }));
    await Notification.insertMany(notifications);

    res.status(201).json({ success: true, data: drive });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update placement drive
// @route   PUT /api/drives/:id
exports.updateDrive = async (req, res) => {
  try {
    let drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    const wasClosed = drive.registrationStatus !== 'open';
    
    drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Notify students if registration opened
    if (wasClosed && req.body.registrationStatus === 'open') {
       const students = await User.find({ role: 'student' });
       const notifications = students.map(student => ({
         user: student._id,
         title: 'Registration Opened',
         message: `Registration is now OPEN for ${drive.driveName}. Apply before the deadline!`,
         type: 'drive',
         link: '/student/dashboard'
       }));
       await Notification.insertMany(notifications);
    }

    res.status(200).json({ success: true, data: drive });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Apply for drive
// @route   POST /api/drives/:id/apply
exports.applyForDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    if (drive.registrationStatus !== 'open') {
      return res.status(400).json({ success: false, message: 'Registration is closed for this drive' });
    }

    // Check if already applied
    const isApplied = drive.applicants.some(
      applicant => applicant.studentId.toString() === req.user.id
    );

    if (isApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied for this drive' });
    }

    drive.applicants.push({ studentId: req.user.id });
    await drive.save();

    res.status(200).json({ success: true, data: drive });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get applicants for a drive
// @route   GET /api/drives/:id/applicants
exports.getApplicants = async (req, res) => {
    try {
      const drive = await PlacementDrive.findById(req.params.id)
        .populate({
            path: 'applicants.studentId',
            select: 'name email',
            populate: { path: 'profile', model: 'Student', select: 'resumeURL' }
        });
      
      if (!drive) {
        return res.status(404).json({ success: false, message: 'Drive not found' });
      }

      // Format response to include resumeURL at student level for UI ease
      const formattedApplicants = drive.applicants.map(app => ({
          ...app.toObject(),
          studentId: {
              ...app.studentId.toObject(),
              resumeURL: app.studentId.profile?.resumeURL
          }
      }));

      res.status(200).json({ success: true, data: formattedApplicants });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
