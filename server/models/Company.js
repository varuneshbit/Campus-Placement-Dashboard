const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true, unique: true, trim: true },
  salary: { type: String, required: true },
  location: { type: String, required: true },
  jobRole: { type: String, required: true },
  description: { type: String },
  hiringStats: {
    previousOffers: { type: Number, default: 0 },
    lastHiringYear: { type: String },
    topSkills: [String]
  },
  history: [{
    action: String,
    date: { type: Date, default: Date.now },
    details: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
