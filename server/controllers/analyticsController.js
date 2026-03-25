const Student = require('../models/Student');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const Interview = require('../models/Interview');

// @desc    Get Analytics Dashboard Data
// @route   GET /api/analytics
exports.getAnalytics = async (req, res) => {
    try {
        // 1. Placement Ratio
        const totalRegistered = await Student.countDocuments({ isRegistered: true, isDeleted: false });
        const placedStudents = await Student.countDocuments({ placementStatus: 'Placed', isDeleted: false });
        const placementRatio = totalRegistered > 0 ? ((placedStudents / totalRegistered) * 100).toFixed(1) : 0;

        // 2. Avg CTC & Total Offers
        const allInterviews = await Interview.find({ result: 'selected' }).populate('driveId', 'salary').lean();
        let totalOffers = allInterviews.length;
        let totalCTC = 0;
        let ctcCount = 0;

        allInterviews.forEach(interview => {
            if (interview.driveId && interview.driveId.salary) {
                // Parse salary
                const salaryStr = String(interview.driveId.salary).toUpperCase();
                let amount = parseFloat(salaryStr.replace(/[^\d.]/g, ''));
                if (!isNaN(amount) && amount > 0) {
                    if (salaryStr.includes('LPA') || amount < 100) {
                       totalCTC += amount;
                    } else if (amount >= 100000) {
                       totalCTC += (amount / 100000);
                    }
                    ctcCount++;
                }
            }
        });
        const avgCTC = ctcCount > 0 ? (totalCTC / ctcCount).toFixed(1) : '0';

        // 3. Total Companies
        const totalCompanies = await Company.countDocuments();

        // 4. Hiring Statistics by Year
        const placedByYearAggr = await Student.aggregate([
            { $match: { placementStatus: 'Placed', isDeleted: false } },
            { $group: { _id: "$batch", placed: { $sum: 1 } } }
        ]);
        const totalByYearAggr = await Student.aggregate([
            { $match: { isRegistered: true, isDeleted: false } },
            { $group: { _id: "$batch", total: { $sum: 1 } } }
        ]);

        const yearMap = {};
        totalByYearAggr.forEach(item => {
            if (item._id) yearMap[item._id] = { name: item._id, placed: 0, total: item.total };
        });
        placedByYearAggr.forEach(item => {
            if (item._id && yearMap[item._id]) yearMap[item._id].placed = item.placed;
        });
        const placementData = Object.values(yearMap).sort((a,b) => String(a.name).localeCompare(String(b.name)));

        // 5. Sector Wise Breakdown
        const industryAggr = await Company.aggregate([
            { $match: { industry: { $exists: true, $ne: "" }, status: 'Approved' } },
            { $group: { _id: "$industry", value: { $sum: 1 } } }
        ]);
        let industryData = industryAggr.map(item => ({ name: item._id || 'Other', value: item.value }));
        if (industryData.length === 0) {
            industryData = [{ name: 'No Data', value: 1 }];
        }

        // 6. Monthly Drive Trends
        const currentYear = new Date().getFullYear();
        const drives = await PlacementDrive.find({ date: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) } });
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthCounts = new Array(12).fill(0);
        
        drives.forEach(drive => {
           if (drive.date) {
               const month = new Date(drive.date).getMonth();
               monthCounts[month]++;
           }
        });

        const driveTrends = monthNames.map((name, index) => ({
            name,
            count: monthCounts[index]
        })).filter(m => m.count > 0);
        
        if (driveTrends.length === 0) {
            driveTrends.push({ name: monthNames[new Date().getMonth()], count: 0 });
        }

        res.json({
            success: true,
            data: {
                placementRatio: `${placementRatio}%`,
                avgCTC: `${avgCTC} LPA`,
                totalCompanies,
                totalOffers,
                placementData,
                industryData,
                driveTrends
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
