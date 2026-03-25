const Student = require('../models/Student');
const Interview = require('../models/Interview');
const User = require('../models/User');

// @desc    Get leaderboard rankings
// @route   GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const type = req.query.type || 'academic';
        const batch = req.query.batch;
        const branch = req.query.branch;
        const skip = (page - 1) * limit;

        let students = [];
        let total = 0;

        let baseFilter = { isDeleted: false };
        if (batch) baseFilter.batch = batch;
        if (branch) baseFilter.branch = branch;

        if (type === 'academic') {
            const filter = { ...baseFilter, cgpa: { $gt: 0 } };
            const [data, count] = await Promise.all([
                Student.find(filter)
                  .select('name rollNumber branch batch cgpa profileImageURL placementStatus email phone skills')
                  .sort({ cgpa: -1 })
                  .skip(skip)
                  .limit(limit),
                Student.countDocuments(filter)
            ]);
            students = data;
            total = count;
        } else {
            const filter = { ...baseFilter, placementStatus: 'Placed' };
            const [data, count] = await Promise.all([
                Student.find(filter)
                  .select('name rollNumber branch batch cgpa profileImageURL placementStatus email phone skills updatedAt')
                  .sort({ updatedAt: -1 })
                  .skip(skip)
                  .limit(limit),
                Student.countDocuments(filter)
            ]);
            students = data;
            total = count;
        }

        res.json({
            success: true,
            data: students,
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
