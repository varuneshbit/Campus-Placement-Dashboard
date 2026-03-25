const Student = require('../models/Student');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const Interview = require('../models/Interview');
const { Parser } = require('json2csv');
const exceljs = require('exceljs');
const PDFDocument = require('pdfkit');

// Helper to send CSV
const sendCSV = (res, filename, fields, data) => {
    try {
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(data);
        res.header('Content-Type', 'text/csv');
        res.attachment(`${filename}.csv`);
        res.send(csv);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error generating CSV' });
    }
};

// Helper to send Excel
const sendExcel = async (res, filename, columns, data) => {
    try {
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet(filename);
        
        worksheet.columns = columns;
        worksheet.addRows(data);
        
        // Style headers
        worksheet.getRow(1).font = { bold: true };
        
        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment(`${filename}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error generating Excel' });
    }
};

// Helper to send PDF (basic tabular format)
const sendPDF = (res, filename, title, columns, data) => {
    try {
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        res.header('Content-Type', 'application/pdf');
        res.attachment(`${filename}.pdf`);
        doc.pipe(res);

        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();

        // Very basic table rendering
        const tableTop = doc.y;
        const columnWidth = 800 / columns.length; // Approximate width fitting landscape A4

        doc.fontSize(10).font('Helvetica-Bold');
        let currentY = tableTop;
        
        // Draw Headers
        columns.forEach((col, i) => {
            doc.text(col.header, 30 + (i * columnWidth), currentY, { width: columnWidth, align: 'left' });
        });
        
        doc.moveDown();
        currentY = doc.y;
        doc.font('Helvetica');

        // Draw Data Rows
        data.forEach(row => {
            if (currentY > 500) { // arbitrary page break
                doc.addPage();
                currentY = 30;
            }
            columns.forEach((col, i) => {
                let text = '';
                if (typeof col.key === 'function') {
                    text = col.key(row);
                } else {
                    text = String(row[col.key] || '');
                }
                doc.text(text, 30 + (i * columnWidth), currentY, { width: columnWidth, align: 'left' });
            });
            doc.moveDown();
            currentY = doc.y;
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error generating PDF' });
    }
};

// @desc Generate Student Placement Report
// @route GET /api/reports/students?format=csv|excel|pdf
exports.exportStudentReport = async (req, res) => {
    try {
        const { format = 'csv' } = req.query;
        const students = await Student.find({ isDeleted: false }).populate('userId', 'name email').lean();
        
        // Fetch placement details
        const selections = await Interview.find({ result: 'selected' })
            .populate('driveId', 'driveName salary')
            .lean();
            
        // Map placements to students
        const selectionMap = {};
        selections.forEach(s => {
            const stuId = s.studentId.toString();
            if (!selectionMap[stuId]) {
                selectionMap[stuId] = [];
            }
            if (s.driveId) {
                selectionMap[stuId].push(`${s.driveId.driveName} (${s.driveId.salary})`);
            }
        });

        const data = students.map(st => {
            const stuId = st.user?._id?.toString() || '';
            const placements = selectionMap[stuId] || [];
            return {
                name: st.user?.name || 'N/A',
                email: st.user?.email || 'N/A',
                rollNumber: st.rollNumber,
                branch: st.branch,
                cgpa: st.cgpa,
                status: placements.length > 0 ? 'Placed' : 'Unplaced',
                company: placements.join(', ') || 'None'
            };
        });

        const columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Roll Number', key: 'rollNumber', width: 15 },
            { header: 'Branch', key: 'branch', width: 15 },
            { header: 'CGPA', key: 'cgpa', width: 10 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Company', key: 'company', width: 30 }
        ];

        const fields = ['name', 'email', 'rollNumber', 'branch', 'cgpa', 'status', 'company'];
        const filename = `Student_Report_${Date.now()}`;

        if (format === 'excel') return sendExcel(res, filename, columns, data);
        if (format === 'pdf') return sendPDF(res, filename, 'Student Placement Report', columns, data);
        return sendCSV(res, filename, fields, data);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Generate Companies Report
// @route GET /api/reports/companies?format=csv|excel|pdf
exports.exportCompanyReport = async (req, res) => {
    try {
        const { format = 'csv' } = req.query;
        const companies = await Company.find().populate('user', 'name email').lean();

        const data = companies.map(c => ({
            companyName: c.companyName,
            industry: c.industry || 'N/A',
            website: c.website || 'N/A',
            contactPerson: c.contactPerson || 'N/A',
            status: c.status || 'Pending',
            email: c.user?.email || 'N/A'
        }));

        const columns = [
            { header: 'Company Name', key: 'companyName', width: 25 },
            { header: 'Industry', key: 'industry', width: 20 },
            { header: 'Website', key: 'website', width: 25 },
            { header: 'Contact Person', key: 'contactPerson', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        const fields = ['companyName', 'industry', 'website', 'contactPerson', 'email', 'status'];
        const filename = `Companies_Report_${Date.now()}`;

        if (format === 'excel') return sendExcel(res, filename, columns, data);
        if (format === 'pdf') return sendPDF(res, filename, 'Companies Report', columns, data);
        return sendCSV(res, filename, fields, data);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Generate Placement Drives Report
// @route GET /api/reports/drives?format=csv|excel|pdf
exports.exportDriveReport = async (req, res) => {
    try {
        const { format = 'csv' } = req.query;
        const drives = await PlacementDrive.find().populate('companyId', 'companyName').lean();

        const data = drives.map(d => ({
            driveName: d.driveName,
            company: d.companyId?.companyName || 'N/A',
            jobRole: d.jobRole || 'N/A',
            salary: d.salary || 'N/A',
            date: d.date ? new Date(d.date).toLocaleDateString() : 'N/A',
            status: d.registrationStatus || 'Upcoming'
        }));

        const columns = [
            { header: 'Drive Name', key: 'driveName', width: 25 },
            { header: 'Company', key: 'company', width: 25 },
            { header: 'Job Role', key: 'jobRole', width: 20 },
            { header: 'Salary', key: 'salary', width: 15 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        const fields = ['driveName', 'company', 'jobRole', 'salary', 'date', 'status'];
        const filename = `Drives_Report_${Date.now()}`;

        if (format === 'excel') return sendExcel(res, filename, columns, data);
        if (format === 'pdf') return sendPDF(res, filename, 'Placement Drives Report', columns, data);
        return sendCSV(res, filename, fields, data);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
