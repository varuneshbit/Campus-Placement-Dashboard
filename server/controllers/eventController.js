const Event = require('../models/Event');
const PlacementDrive = require('../models/PlacementDrive');
const Interview = require('../models/Interview');
const Student = require('../models/Student');

// @desc    Get all calendar events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
    try {
        // 1. Fetch custom events
        let eventFilter = {};
        if (req.user.role === 'student') {
            // Students get drives and interviews specifically filtered from their respective collections.
            // Hide hardcoded/seeded drive and interview events from the generic Event collection.
            eventFilter = { type: { $in: ['other', 'result'] } };
        }
        const customEvents = await Event.find(eventFilter);
        
        // 2. Fetch drives as events
        let driveFilter = {};
        if (req.user.role === 'student') {
            driveFilter = { 'applicants.studentId': req.user.id };
        }
        
        const drives = await PlacementDrive.find(driveFilter).populate('companyId');
        const driveEvents = drives.map(drive => ({
            _id: drive._id,
            title: `Drive: ${drive.driveName} (${drive.companyId?.companyName})`,
            start: drive.date,
            end: new Date(new Date(drive.date).getTime() + 2 * 60 * 60 * 1000), // Default 2h duration
            type: 'drive',
            allDay: false,
            description: `Job Role: ${drive.jobRole}, Salary: ${drive.salary}`
        }));

        // 3. Fetch interviews as events
        let interviewFilter = {};
        if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user.id });
            if (student) {
                interviewFilter.studentId = student._id;
            } else {
                interviewFilter.studentId = null; // Prevent showing others' interviews
            }
        }

        const interviews = await Interview.find(interviewFilter)
            .populate('driveId')
            .populate('studentId', 'name');

        const interviewEvents = interviews.map(interview => ({
            _id: interview._id,
            title: `Interview: ${interview.round} - ${interview.studentId?.name}`,
            start: interview.interviewDate,
            end: new Date(new Date(interview.interviewDate).getTime() + 60 * 60 * 1000), // Default 1h
            type: 'interview',
            allDay: false,
            description: `Drive: ${interview.driveId?.driveName}, Meeting: ${interview.meetingLink || 'N/A'}`
        }));

        const allEvents = [
            ...customEvents,
            ...driveEvents,
            ...interviewEvents
        ];

        res.status(200).json({ success: true, count: allEvents.length, data: allEvents });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create a custom event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const event = await Event.create(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        await event.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
