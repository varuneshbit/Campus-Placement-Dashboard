const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rollNumber: { type: String, required: true, unique: true },
  batch: { type: String, required: true },
  branch: { type: String, required: true },
  cgpa: { type: Number, required: true },
  tenthPercentage: { type: Number },
  twelfthPercentage: { type: Number },
  backlogs: { type: Number, default: 0 },
  resumeURL: { type: String },
  profileImageURL: { type: String },
  phone: { type: String },
  skills: [String],
  projects: [{
    title: String,
    description: String,
    techStack: [String]
  }],
  resumeAnalysis: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    missingSkills: [String],
    suggestions: [String]
  },
  placementStatus: {
    type: String,
    enum: ['Not Placed', 'Placed'],
    default: 'Not Placed'
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
