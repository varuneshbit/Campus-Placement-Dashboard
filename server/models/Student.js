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
  resumeURL: { type: String },
  phone: { type: String },
  skills: [String]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
