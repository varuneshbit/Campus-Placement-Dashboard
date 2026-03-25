const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  email: { type: String },
  name: { type: String },
  rollNumber: { type: String, required: true, unique: true },
  batch: { type: String },
  branch: { type: String },
  cgpa: { type: Number },
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
  },
  isRegistered: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['excel', 'self-register', 'manual'],
    default: 'self-register'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  profileCompletionPct: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

studentSchema.index({ email: 1 });
studentSchema.index({ userId: 1 });

module.exports = mongoose.model('Student', studentSchema);
