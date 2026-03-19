const Student = require('../models/Student');
const Interview = require('../models/Interview');
const User = require('../models/User');

// @desc    Get leaderboard rankings
// @route   GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        // 1. Highest CGPA
        const topCGPA = await Student.find()
            .populate('user', 'name email')
            .sort({ cgpa: -1 })
            .limit(10);

        // 2. Most Interviews Cleared
        const topInterviews = await Interview.aggregate([
            { $match: { result: 'selected' } },
            { $group: { _id: '$studentId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'profile'
                }
            },
            { $unwind: '$profile' }
        ]);

        // 3. Top Placed (Highest Salary)
        const selections = await Interview.find({ result: 'selected' })
            .populate('driveId')
            .populate('studentId', 'name email')
            .limit(100);

        const topPlacedList = [];
        for (let s of selections) {
            if (!s.driveId || !s.studentId) continue;
            
            // Fetch student profile to get the branch
            const profile = await Student.findOne({ user: s.studentId._id });
            
            let salaryValue = 0;
            if (s.driveId.salary) {
                // Try to extract number using regex e.g. "12 LPA", "10.5", "10-12 LPA" -> 12
                const match = s.driveId.salary.match(/(\d+(\.\d+)?)/g);
                if (match && match.length > 0) {
                    // If range like 10-12, take the higher one
                    salaryValue = Math.max(...match.map(n => parseFloat(n)));
                }
            }

            topPlacedList.push({
                student: s.studentId,
                profile: profile,
                company: s.driveId.driveName,
                salary: s.driveId.salary,
                salaryValue: salaryValue
            });
        }

        const topPlaced = topPlacedList
            .sort((a, b) => b.salaryValue - a.salaryValue)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                topCGPA,
                topInterviews,
                topPlaced
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
