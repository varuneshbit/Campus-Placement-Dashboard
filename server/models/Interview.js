const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  driveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementDrive',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  round: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    default: 'Online'
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
    enum: ['scheduled', 'completed', 'cancelled', 'deferred', 'no show'],
    default: 'scheduled'
  },
  result: {
    type: String,
    enum: ['pending', 'selected', 'rejected', 'on hold'],
    default: 'pending'
  },
  feedback: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
