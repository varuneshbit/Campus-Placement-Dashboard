const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Student = require('../models/Student');
const PlacementDrive = require('../models/PlacementDrive');
const ExcelJS = require('exceljs');

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
    let oldInterview = await Interview.findById(req.params.id);

    if (!oldInterview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const { scheduledDate, scheduledTime, status, result, mode, round, feedback } = req.body;
    const oldResult = oldInterview.result;
    
    // Check if combined date/time needs to be created
    const updateObj = { ...req.body };
    if (scheduledDate && scheduledTime) {
      updateObj.interviewDate = new Date(`${scheduledDate}T${scheduledTime}`);
    }
    if (status) updateObj.status = status.toLowerCase();
    if (result) updateObj.result = result.toLowerCase();
    
    const interview = await Interview.findByIdAndUpdate(req.params.id, updateObj, {
      new: true,
      runValidators: true
    }).populate('studentId', 'name email branch rollNumber photoURL')
      .populate('driveId', 'driveName company'); // Adjust 'company' based on exactly what frontend renders

    // Notify if result is announced
    const finalResult = interview.result;
    if (finalResult && finalResult !== 'pending' && finalResult !== oldResult) {
      await Notification.create({
        user: interview.studentId,
        title: 'Interview Result Announced',
        message: `Your result for the interview round ${interview.round} is: ${finalResult.toUpperCase()}`,
        type: 'result',
        link: '/student/results'
      });
    }

    res.status(200).json({ success: true, data: interview, interview: interview });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete interview
// @route   DELETE /api/interviews/:id
exports.deleteInterview = async (req, res) => {
  try {
    const deleted = await Interview.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.status(200).json({ success: true, message: 'Interview deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all interviews for student
// @route   GET /api/interviews/student
exports.getStudentInterviews = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const interviews = await Interview.find({ studentId: student._id })
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
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip  = (page - 1) * limit;

    const [interviews, total] = await Promise.all([
      Interview.find()
        .populate('driveId', 'driveName')
        .populate('studentId', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Interview.countDocuments()
    ]);

    res.status(200).json({ 
      success: true, 
      interviews,
      data: interviews, // Fallback for existing components
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

// @desc    Bulk create interviews
// @route   POST /api/interviews/bulk
exports.bulkCreateInterviews = async (req, res) => {
  try {
    const { interviews } = req.body;

    if (!interviews || !Array.isArray(interviews) || interviews.length === 0) {
      return res.status(400).json({ message: 'No interviews provided' });
    }

    if (interviews.length > 200) {
      return res.status(400).json({ message: 'Maximum 200 interviews per bulk request' });
    }

    // Validate all students exist and are not blocked
    const studentIds = [...new Set(interviews.map(i => i.student))];
    const students = await Student.find({
      _id: { $in: studentIds },
      isDeleted: false
    });

    const blockedStudents = students.filter(s => s.isBlocked);
    if (blockedStudents.length > 0) {
      return res.status(400).json({
        message: `${blockedStudents.length} student(s) are blocked and cannot be scheduled`,
        blockedNames: blockedStudents.map(s => s.name)
      });
    }

    // Check for duplicate interviews (same student + drive combination)
    const existingInterviews = await Interview.find({
      studentId: { $in: studentIds },
      driveId: interviews[0].drive,
      round: interviews[0].round
    });

    const existingStudentIds = new Set(
      existingInterviews.map(i => i.studentId.toString())
    );

    const newInterviews = interviews.filter(
      i => !existingStudentIds.has(i.student.toString())
    );

    const skipped = interviews.length - newInterviews.length;

    if (newInterviews.length === 0) {
      return res.status(400).json({
        message: `All selected students already have an interview scheduled for Round ${interviews[0].round} of this drive`
      });
    }

    // Map the incoming 'student', 'drive', 'scheduledDate' to your schema (studentId, driveId, interviewDate)
    const formattedInterviews = newInterviews.map(i => ({
      studentId: i.student,
      driveId: i.drive,
      interviewDate: i.scheduledDate,
      round: i.round,
      mode: i.mode,
      status: i.status || 'scheduled',
      result: i.result || 'pending'
    }));

    // Insert all at once
    const created = await Interview.insertMany(formattedInterviews, { ordered: false });

    // Populate and return
    const populated = await Interview.find({
      _id: { $in: created.map(i => i._id) }
    })
      .populate('studentId', 'name email branch rollNumber photoURL')
      .populate({ path: 'driveId', populate: { path: 'companyId', select: 'name' } });

    res.status(201).json({
      success: true,
      created: populated.length,
      skipped,
      interviews: populated,
      message: skipped > 0
        ? `${populated.length} interviews scheduled. ${skipped} skipped (already existed).`
        : `${populated.length} interviews scheduled successfully.`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @desc    Import interviews via Excel
// @route   POST /api/interviews/import-excel
exports.importInterviews = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];

    const results = {
      total: 0,
      created: 0,
      skipped: 0,
      errors: []
    };

    const interviewsToCreate = [];

    // Process rows sequentially because of async DB lookups
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      const rollNumber = row.getCell(1).value?.toString()?.trim();
      const driveName = row.getCell(2).value?.toString()?.trim();
      const dateStr = row.getCell(3).value?.toString()?.trim();
      const timeStr = row.getCell(4).value?.toString()?.trim();
      const round = row.getCell(5).value?.toString()?.trim() || '1';
      const mode = row.getCell(6).value?.toString()?.trim() || 'Online';

      if (!rollNumber && !driveName && !dateStr && !timeStr) continue; // Skip empty rows
      results.total++;

      if (!rollNumber || !driveName || !dateStr || !timeStr) {
        results.skipped++;
        results.errors.push({ row: rowNumber, reason: 'Missing required fields (RollNumber, DriveName, Date, Time)' });
        continue;
      }

      // Find Student dynamically
      const student = await Student.findOne({ rollNumber: new RegExp('^' + rollNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
      
      if (!student) {
        results.skipped++;
        results.errors.push({ row: rowNumber, reason: `Student with roll number ${rollNumber} not found` });
        continue;
      }
      if (student.isBlocked || student.isDeleted) {
        results.skipped++;
        results.errors.push({ row: rowNumber, reason: `Student ${rollNumber} is blocked or deleted` });
        continue;
      }

      // Find Drive dynamically (by jobRole or driveName)
      const driveRegex = new RegExp('^' + driveName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
      const drive = await PlacementDrive.findOne({
        $or: [
          { driveName: driveRegex },
          { jobRole: driveRegex }
        ]
      });

      if (!drive) {
        results.skipped++;
        results.errors.push({ row: rowNumber, reason: `Placement Drive "${driveName}" not found` });
        continue;
      }

      // Validate Date and Time (Assuming date is YYYY-MM-DD and time is HH:MM in excel, handle Date objects if excel formats them)
      let combinedDateTime;
      if (row.getCell(3).type === ExcelJS.ValueType.Date) {
         // If Excel cell is already a Date type, extract the date part
         const excelDate = row.getCell(3).value;
         const dateString = [
             excelDate.getFullYear(),
             ('0' + (excelDate.getMonth() + 1)).slice(-2),
             ('0' + excelDate.getDate()).slice(-2)
         ].join('-');
         
         // Extract time part if timeStr is also a Date, or parse string
         let timeString = timeStr;
         if (row.getCell(4).type === ExcelJS.ValueType.Date) {
             const excelTime = row.getCell(4).value;
             timeString = [
                 ('0' + excelTime.getHours()).slice(-2),
                 ('0' + excelTime.getMinutes()).slice(-2)
             ].join(':');
         }
         combinedDateTime = new Date(`${dateString}T${timeString}`);
      } else {
         combinedDateTime = new Date(`${dateStr}T${timeStr}`);
      }

      if (isNaN(combinedDateTime.getTime())) {
        results.skipped++;
        results.errors.push({ row: rowNumber, reason: `Invalid Date/Time configuration` });
        continue;
      }

      const isDuplicateInBatch = interviewsToCreate.find(i => 
        i.studentId.toString() === student._id.toString() && 
        i.driveId.toString() === drive._id.toString()
      );

      if (isDuplicateInBatch) {
        results.skipped++;
        results.errors.push({ row: rowNumber, reason: `Duplicate assignment for ${rollNumber} in this file` });
        continue;
      }

      const existingInterview = await Interview.findOne({
        studentId: student._id,
        driveId: drive._id
      });

      if (existingInterview) {
        results.skipped++;
        results.errors.push({ row: rowNumber, reason: `Student ${rollNumber} is already scheduled for this drive` });
        continue;
      }

      interviewsToCreate.push({
        studentId: student._id,
        driveId: drive._id,
        interviewDate: combinedDateTime,
        round: round,
        mode: mode,
        status: 'scheduled',
        result: 'pending'
      });
    }

    if (interviewsToCreate.length > 0) {
      const created = await Interview.insertMany(interviewsToCreate, { ordered: false });
      results.created = created.length;
    }

    res.status(200).json({
      success: true,
      message: `Successfully scheduled ${results.created} interviews`,
      ...results
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
