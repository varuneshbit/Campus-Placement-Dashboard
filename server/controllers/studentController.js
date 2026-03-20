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
    const { branch, batch, search } = req.query;
    
    // Build query
    let query = {};
    if (branch) query.branch = branch;
    if (batch) query.batch = batch;
    
    // Find students matching query
    let students = await Student.find(query).populate('user', 'name email');
    
    // Apply search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      students = students.filter(student => 
        searchRegex.test(student.rollNumber) || 
        (student.user && searchRegex.test(student.user.name)) ||
        (student.user && searchRegex.test(student.user.email))
      );
    }
    
    res.status(200).json({ success: true, count: students.length, data: students });
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
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const { Name, Email, RollNumber, Branch, Batch, CGPA } = row;
      
      // Validation
      if (!Name || !Email || !RollNumber || !Branch || !Batch || CGPA == null) {
        errors.push(`Row ${i + 2}: Missing required fields (Name, Email, RollNumber, Branch, Batch, CGPA)`);
        continue;
      }
      
      try {
        // Check if user exists
        let user = await User.findOne({ email: Email });
        if (!user) {
          user = await User.create({
            name: Name,
            email: Email,
            password: 'Student@123', // Default password
            role: 'student'
          });
        }
        
        // Check if student exists
        let student = await Student.findOne({ rollNumber: RollNumber });
        if (student) {
          errors.push(`Row ${i + 2}: RollNumber ${RollNumber} already exists`);
          continue;
        }
        
        await Student.create({
          user: user._id,
          rollNumber: String(RollNumber),
          branch: String(Branch),
          batch: String(Batch),
          cgpa: Number(CGPA)
        });
        
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
    const students = await Student.find().populate('user', 'name email');
    
    const data = students.map(student => ({
      Name: student.user ? student.user.name : 'N/A',
      Email: student.user ? student.user.email : 'N/A',
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
