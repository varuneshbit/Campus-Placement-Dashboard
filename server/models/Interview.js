const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  driveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementDrive',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  round: {
    type: String,
    required: true
  },
  interviewDate: {
    type: Date,
    required: true
  },
  meetingLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'deferred'],
    default: 'scheduled'
  },
  result: {
    type: String,
    enum: ['pending', 'selected', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
