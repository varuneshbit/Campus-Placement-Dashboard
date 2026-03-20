const Student = require('../models/Student');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini (Ensure GEMINI_API_KEY is in your .env file)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Analyze uploaded resume
// @route   POST /api/resume/analyze
exports.analyzeResume = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        let filePath = '';
        
        // If a new file was uploaded, use it. Save it as the new resume URL.
        if (req.file) {
            filePath = req.file.path;
            student.resumeURL = `/uploads/resumes/${req.file.filename}`;
        } else if (student.resumeURL) {
            // Use existing file
            const resumePath = student.resumeURL.startsWith('/') ? student.resumeURL.substring(1) : student.resumeURL;
            filePath = path.join(__dirname, '..', resumePath);
        } else {
            return res.status(400).json({ success: false, message: 'No resume found. Please upload one first.' });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Resume file missing on server.' });
        }

        // Extract Text
        let text = '';
        const ext = path.extname(filePath).toLowerCase();
        
        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            text = data.text;
        } else if (ext === '.doc' || ext === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        } else {
            return res.status(400).json({ success: false, message: 'Unsupported file type. Only PDF and DOCX are allowed.' });
        }

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Failed to extract text from resume. Ensure it is not an image-only file.' });
        }

        // Check if API key exists
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is missing in server environment variables.' });
        }

        // Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Analyze this resume and STRICTLY return JSON only in this format:
{
"score": number,
"strengths": string[],
"weaknesses": string[],
"missingSkills": string[],
"suggestions": string[]
}

Do not include any extra explanation.

Resume:
${text.substring(0, 15000)}`;

        const result = await model.generateContent(prompt);
        let rawContent = result.response.text();

        // Clean up response if the model returned markdown blocks despite the instruction
        rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        let analysisJSON;
        try {
            analysisJSON = JSON.parse(rawContent);
        } catch (jsonErr) {
            console.error('Failed to parse Gemini response JSON:', rawContent);
            return res.status(500).json({ success: false, message: 'AI returned malformed data.' });
        }

        // Save Analysis to Student profile
        student.resumeAnalysis = analysisJSON;
        await student.save();

        res.status(200).json({
            success: true,
            data: analysisJSON,
            message: 'Analysis complete'
        });
        
    } catch (err) {
        console.error('Resume Analysis Error:', err);
        res.status(500).json({ success: false, message: 'Failed to analyze resume: ' + err.message });
    }
};
