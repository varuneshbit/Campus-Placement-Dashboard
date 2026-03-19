const Student = require('../models/Student');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Basic dictionary for skills matching
const SKILL_DICTIONARY = [
    'javascript', 'python', 'java', 'c++', 'c#', 'react', 'node.js', 'express', 
    'mongodb', 'sql', 'mysql', 'postgresql', 'aws', 'docker', 'kubernetes', 
    'git', 'html', 'css', 'typescript', 'angular', 'vue', 'django', 'flask', 
    'spring', 'hibernate', 'agile', 'scrum', 'leadership', 'communication',
    'problem solving', 'machine learning', 'data science', 'ai'
];

// Sections to look for
const SECTIONS = ['education', 'experience', 'projects', 'skills', 'certifications'];

// @desc    Analyze uploaded resume
// @route   GET /api/resume/analyze
exports.analyzeResume = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student || !student.resumeURL) {
            return res.status(404).json({ success: false, message: 'No resume found. Please upload one first.' });
        }

        // Only handle PDFs currently for text parsing, return basic for DOCX
        if (!student.resumeURL.toLowerCase().endsWith('.pdf')) {
            return res.status(400).json({ 
                success: false, 
                message: 'AI Analyzer currently only supports PDF resumes.' 
            });
        }

        const resumePath = student.resumeURL.startsWith('/') ? student.resumeURL.substring(1) : student.resumeURL;
        const filePath = path.join(__dirname, '..', resumePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: `Resume file missing on server. Looking at: ${filePath}` });
        }

        // Parse PDF
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        const text = data.text.toLowerCase();

        // 1. Extract Skills
        const foundSkills = [];
        for (const skill of SKILL_DICTIONARY) {
            if (text.includes(skill)) {
                foundSkills.push(skill);
            }
        }

        // 2. Identify Sections
        const foundSections = [];
        const missingSections = [];
        for (const section of SECTIONS) {
            if (text.includes(section)) {
                foundSections.push(section);
            } else {
                missingSections.push(section);
            }
        }

        // 3. Generate Score (Simulated)
        let score = 50; // Base score
        const wordCount = text.split(/\s+/).length;

        if (wordCount > 300 && wordCount < 800) score += 10; // Good length
        if (wordCount > 800) score += 5; // Maybe too long but okay
        
        score += Math.min(foundSkills.length * 2, 20); // Up to 20 pts for skills
        score += Math.min(foundSections.length * 4, 20); // Up to 20 pts for sections

        // Cap at 100
        score = Math.min(score, 100);

        // 4. Generate Suggestions
        const suggestions = [];
        if (missingSections.includes('experience')) {
            suggestions.push('Consider adding an "Experience" section. If you lack formal experience, include internships or relevant student clubs.');
        }
        if (missingSections.includes('projects')) {
            suggestions.push('Include a "Projects" section to showcase practical applications of your skills.');
        }
        if (foundSkills.length < 5) {
            suggestions.push('Your resume seems light on technical or soft skills. Try to explicitly list technologies or methodologies you are familiar with.');
        }
        if (wordCount < 200) {
            suggestions.push('Your resume is quite short. Add more detail to your projects and education to provide a complete picture.');
        }
        if (suggestions.length === 0) {
            suggestions.push('Great job! Your resume looks solid and well-structured.');
        }

        res.status(200).json({
            success: true,
            data: {
                score,
                extractedSkills: foundSkills,
                foundSections,
                missingSections,
                suggestions,
                wordCount
            }
        });
        
    } catch (err) {
        console.error('Resume Analysis Error:', err);
        res.status(500).json({ success: false, message: 'Failed to analyze resume: ' + err.message });
    }
};
