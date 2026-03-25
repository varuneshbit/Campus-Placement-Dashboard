const User = require('../models/User');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, branch, batch, cgpa, rollNumber } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (role === 'student') {
        const matchQuery = rollNumber
            ? { $or: [{ rollNumber }, { email }] }
            : { email };

        const student = await Student.findOneAndUpdate(
            matchQuery,
            {
                $set: {
                    userId: user._id,
                    user: user._id,
                    isRegistered: true,
                    name,
                    email,
                    ...(branch && { branch }),
                    ...(batch && { batch }),
                    ...(cgpa && { cgpa }),
                    ...(rollNumber && { rollNumber })
                },
                $setOnInsert: {
                    source: 'self-register',
                    placementStatus: 'Not Placed',
                    isBlocked: false,
                    isDeleted: false
                }
            },
            { upsert: true, new: true, runValidators: true }
        );
        user.studentId = student._id;
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    console.log(`Login attempt for: ${email}`);
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    console.log(`Password match: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role === 'student') {
        const student = await Student.findOne({ email: user.email });
        if (student) user.studentId = student._id;
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/profile
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token payload containing user id and potentially studentId
  const payload = { 
      id: user._id, 
      userId: user._id, 
      role: user.role 
  };
  
  if (user.studentId) {
      payload.studentId = user.studentId;
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.studentId && { studentId: user.studentId })
    }
  });
};

// @desc    Get all students
// @route   GET /api/auth/students
exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('name email');
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
