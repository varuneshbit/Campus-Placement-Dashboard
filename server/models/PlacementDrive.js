const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
  driveName: { type: String, required: true, trim: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  jobRole: { type: String, required: true },
  salary: { type: String, required: true },
  date: { type: Date, required: true },
  batch: { type: String, required: true },
  eligibility: {
    minCGPA: { type: Number, default: 0 },
    branches: [String]
  },
  registrationStatus: { 
    type: String, 
    enum: ['open', 'closed', 'upcoming'], 
    default: 'upcoming' 
  },
  applicants: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
