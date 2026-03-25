const Student = require('../models/Student');
const User = require('../models/User');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// @desc    Create or Update student profile
// @route   PUT /api/students/profile/update
exports.updateProfile = async (req, res) => {
  try {
    const { 
      rollNumber, batch, branch, cgpa, tenthPercentage, twelfthPercentage, 
      backlogs, phone, skills, projects 
    } = req.body;
    
    let student = await Student.findOne({ user: req.user.id });
    
    if (student) {
      // Update
      student.rollNumber = rollNumber || student.rollNumber;
      student.batch = batch || student.batch;
      student.branch = branch || student.branch;
      student.cgpa = cgpa !== undefined ? cgpa : student.cgpa;
      student.tenthPercentage = tenthPercentage !== undefined ? tenthPercentage : student.tenthPercentage;
      student.twelfthPercentage = twelfthPercentage !== undefined ? twelfthPercentage : student.twelfthPercentage;
      student.backlogs = backlogs !== undefined ? backlogs : student.backlogs;
      student.phone = phone || student.phone;
      if (skills) student.skills = skills;
      if (projects) student.projects = projects;
      
      await student.save();
    } else {
      // Create
      student = await Student.create({
        user: req.user.id,
        rollNumber, batch, branch, cgpa, tenthPercentage, twelfthPercentage,
        backlogs, phone, skills, projects
      });
    }
    
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Upload or Update resume
// @route   POST /api/students/profile/upload-resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    let student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Please create profile first before uploading resume' });
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

// @desc    Upload profile image
// @route   POST /api/students/profile/upload-image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    let student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Please create profile first before uploading image' });
    }

    if (student.profileImageURL) {
      const oldPath = path.join(__dirname, '..', student.profileImageURL);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    student.profileImageURL = `/uploads/images/${req.file.filename}`;
    await student.save();

    res.status(200).json({
      success: true,
      data: student.profileImageURL
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

    // Calculate profile strength
    let score = 0;
    
    // basic details (30%)
    if (student.rollNumber && student.batch && student.branch && student.phone) score += 30;
    else if (student.rollNumber || student.batch || student.branch || student.phone) score += 15;
    
    // academic details (30%)
    if (student.cgpa !== undefined && student.tenthPercentage !== undefined && student.twelfthPercentage !== undefined) score += 30;
    else if (student.cgpa !== undefined || student.tenthPercentage !== undefined) score += 15;
    
    // skills (20%)
    if (student.skills && student.skills.length > 0) score += 20;
    
    // resume (20%)
    if (student.resumeURL) score += 20;

    const profileData = { ...student.toObject(), profileCompletion: score };

    res.status(200).json({ success: true, data: profileData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get student projects
// @route   GET /api/students/profile/projects
exports.getProjects = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    res.status(200).json({ success: true, data: student.projects || [] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Add a student project
// @route   POST /api/students/profile/projects
exports.addProject = async (req, res) => {
  try {
    const { title, description, techStack } = req.body;
    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = await Student.create({ user: req.user.id, projects: [] });
    }
    
    const formattedTechStack = Array.isArray(techStack) 
      ? techStack 
      : (techStack ? techStack.split(',').map(s => s.trim()) : []);

    const newProject = { title, description, techStack: formattedTechStack };
    student.projects.push(newProject);
    await student.save();
    
    res.status(201).json({ success: true, data: student.projects });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update a student project
// @route   PUT /api/students/profile/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const { title, description, techStack } = req.body;
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const project = student.projects.id(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (techStack !== undefined) {
      project.techStack = Array.isArray(techStack) 
        ? techStack 
        : techStack.split(',').map(s => s.trim()).filter(Boolean);
    }

    await student.save();
    res.status(200).json({ success: true, data: student.projects });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete a student project
// @route   DELETE /api/students/profile/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    student.projects.pull(req.params.id);
    await student.save();

    res.status(200).json({ success: true, data: student.projects });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all students (Admin)
// @route   GET /api/students
exports.getStudents = async (req, res) => {
  try {
    const { branch, batch, search, isRegistered, isBlocked, accountStatus } = req.query;
    
    const filter = { isDeleted: false };
    
    if (branch) filter.branch = branch;
    if (batch) filter.batch = batch;
    
    // Handle accountStatus filter
    if (accountStatus === 'registered') {
      filter.isRegistered = true;
      filter.isBlocked = false;
    }
    else if (accountStatus === 'pending') {
      filter.isRegistered = false;
      filter.isBlocked = false;
    }
    else if (accountStatus === 'blocked') {
      filter.isBlocked = true;
      // NOTE: when showing blocked students, keep isDeleted: false so soft-deleted are still hidden
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('userId', 'email createdAt lastLogin')
        .sort({ cgpa: -1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(filter)
    ]);
    
    res.status(200).json({ 
      success: true, 
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Add a single student (Admin)
// @route   POST /api/students
exports.addStudent = async (req, res) => {
  try {
    const { name, email, rollNumber, branch, batch, cgpa } = req.body;
    
    if (!name || !email || !rollNumber || !branch || !batch) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    
    const DEFAULT_PASSWORD = 'Student@1234';
    
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name, email, password: DEFAULT_PASSWORD, role: 'student'
      });
    }

    let student = await Student.findOne({ rollNumber });
    if (student) {
      return res.status(400).json({ success: false, message: 'Student with this roll number already exists' });
    }

    student = await Student.create({
      name, email, rollNumber, branch, batch, cgpa: cgpa || 0,
      userId: user._id, user: user._id, source: 'manual', isRegistered: true
    });
    
    if (!user.studentId) {
      user.studentId = student._id;
      await user.save();
    }
    
    res.status(201).json({ success: true, data: student, message: 'Student added successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Add a single student (Admin)
// @route   POST /api/students
exports.addStudent = async (req, res) => {
  try {
    const { name, email, rollNumber, branch, batch, cgpa } = req.body;

    if (!name || !email || !rollNumber || !branch || !batch || cgpa == null) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Default password for manually added students
    const DEFAULT_PASSWORD = 'Student@1234';

    // 1. Check if User exists
    let user = await User.findOne({ email: String(email) });
    
    if (!user) {
      // Create User account if it doesn't exist
      user = await User.create({
        name: String(name),
        email: String(email),
        password: DEFAULT_PASSWORD,
        role: 'student'
      });
    }

    // 2. Create or Update Student record
    let student = await Student.findOne({ rollNumber: String(rollNumber) });
    if (student) {
      return res.status(400).json({ success: false, message: 'Student with this roll number already exists' });
    }

    student = await Student.create({
      name: String(name),
      email: String(email),
      rollNumber: String(rollNumber),
      branch: String(branch),
      batch: String(batch),
      cgpa: Number(cgpa),
      userId: user._id,
      user: user._id,
      source: 'manual',
      isRegistered: true,
      placementStatus: 'Not Placed',
      isBlocked: false,
      isDeleted: false
    });

    // Save student ID in user if missing
    if (!user.studentId) {
      user.studentId = student._id;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      student
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Bulk upload students via Excel (Admin)
// @route   POST /api/students/bulk-upload
exports.bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
    
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    if (data.length === 0) return res.status(400).json({ success: false, message: 'Excel file is empty' });
    
    let successCount = 0;
    let errors = [];
    
    // Default password for bulk uploaded students
    const DEFAULT_PASSWORD = 'Student@1234';
    
    for (let i = 0; i < data.length; i++) {
        // Headers are case-sensitive usually
        const row = data[i];
        
        // Ensure robust reading order/names based on prompt expectation
        const keys = Object.keys(row);
        const rollNumber = row[keys[0]] || row['RollNumber'];
        const email = row[keys[1]] || row['Email'];
        const name = row[keys[2]] || row['Name'];
        const branch = row[keys[3]] || row['Branch'];
        const batch = row[keys[4]] || row['Batch'];
        const cgpa = row[keys[5]] || row['CGPA'];
      
      // Validation
      if (!name || !email || !rollNumber || !branch || !batch || cgpa == null) {
        errors.push(`Row ${i + 2}: Missing required fields`);
        continue;
      }
      
      try {
        // 1. First, check if User exists
        let user = await User.findOne({ email: String(email) });
        
        if (!user) {
          // Create User account if it doesn't exist
          user = await User.create({
            name: String(name),
            email: String(email),
            password: DEFAULT_PASSWORD,
            role: 'student' // Assign role correctly
          });
        }

        // 2. Create or Update Student record
        const student = await Student.findOneAndUpdate(
          { rollNumber: String(rollNumber) },
          {
            $set: {
              name: String(name),
              branch: String(branch),
              batch: String(batch),
              cgpa: Number(cgpa),
              userId: user._id, 
              user: user._id
            },
            $setOnInsert: {
              email: String(email),
              source: 'excel',
              isRegistered: true, // We consider them registered since they have an account
              placementStatus: 'Not Placed',
              isBlocked: false,
              isDeleted: false
            }
          },
          { upsert: true, new: true, runValidators: true }
        );
        
        // Save student ID in user if missing
        if (!user.studentId) {
            user.studentId = student._id;
            await user.save();
        }

        successCount++;
      } catch (err) {
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: `Successfully uploaded ${successCount} students.`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Export student data to Excel (Admin)
// @route   GET /api/students/export
exports.exportStudents = async (req, res) => {
  try {
    const { branch, batch, search, accountStatus } = req.query;
    const filter = { isDeleted: false };
    
    if (branch) filter.branch = branch;
    if (batch) filter.batch = batch;
    
    if (accountStatus === 'registered') {
      filter.isRegistered = true;
      filter.isBlocked = false;
    } else if (accountStatus === 'pending') {
      filter.isRegistered = false;
      filter.isBlocked = false;
    } else if (accountStatus === 'blocked') {
      filter.isBlocked = true;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter).populate('userId user', 'email name');
    
    const data = students.map(student => ({
      Name: student.name || (student.user && student.user.name) || (student.userId && student.userId.name) || 'N/A',
      Email: student.email || (student.user && student.user.email) || (student.userId && student.userId.email) || 'N/A',
      RollNumber: student.rollNumber,
      Branch: student.branch,
      Batch: student.batch,
      CGPA: student.cgpa,
      PlacementStatus: student.placementStatus || 'Unplaced'
    }));
    
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="students.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Block a student (Admin)
// @route   PUT /api/students/:id/block
exports.blockStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Unblock a student (Admin)
// @route   PUT /api/students/:id/unblock
exports.unblockStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update placement status (Admin)
// @route   PUT /api/students/:id/status
exports.updatePlacementStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Not Placed', 'Placed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const student = await Student.findByIdAndUpdate(req.params.id, { placementStatus: status }, { new: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete a student (Admin)
// @route   DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }
    await student.deleteOne();
    
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get eligible students for drive
// @route   GET /api/students/eligible
exports.getEligibleStudents = async (req, res) => {
  try {
    const { minCGPA, branches } = req.query;

    const filter = {
      isDeleted: false,
      isBlocked: false
    };

    // Only apply CGPA filter if minCGPA is a valid number greater than 0
    if (minCGPA && !isNaN(parseFloat(minCGPA)) && parseFloat(minCGPA) > 0) {
      filter.cgpa = { $gte: parseFloat(minCGPA) };
    }

    // Only apply branch filter if branches param is not empty
    if (branches && branches.trim() !== '') {
      const branchList = branches.split(',').map(b => b.trim()).filter(Boolean);
      if (branchList.length > 0) {
        filter.branch = { $in: branchList };
      }
    }

    console.log('Eligible students filter:', filter); // debug log

    const students = await Student.find(filter)
      .select('name email rollNumber branch batch cgpa profileImageURL isRegistered')
      .sort({ cgpa: -1 })
      .limit(500);

    console.log('Eligible students found:', students.length); // debug log

    // Some frontend components expect photoURL, your schema uses profileImageURL
    const mappedStudents = students.map(s => {
       const obj = s.toObject();
       obj.photoURL = obj.profileImageURL;
       return obj;
    });

    res.json({ success: true, students: mappedStudents, total: students.length });
  } catch (err) {
    console.error('getEligibleStudents error:', err);
    res.status(500).json({ message: err.message });
  }
};
