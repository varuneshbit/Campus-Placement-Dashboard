const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

const User = require('./models/User');
const Student = require('./models/Student');
const Company = require('./models/Company');
const PlacementDrive = require('./models/PlacementDrive');
const Interview = require('./models/Interview');
const Event = require('./models/Event');

const exportData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/placementDB');
    console.log('MongoDB Connected for Export...');

    const users = await User.find({}).select('+password').lean();
    const students = await Student.find({}).lean();
    const companies = await Company.find({}).lean();
    const drives = await PlacementDrive.find({}).lean();
    const interviews = await Interview.find({}).lean();
    const events = await Event.find({}).lean();

    const data = { users, students, companies, drives, interviews, events };

    fs.writeFileSync('./seed-data.json', JSON.stringify(data, null, 2));
    console.log(`✅ Exported: ${users.length} users, ${students.length} students, ${companies.length} companies, ${drives.length} drives, ${interviews.length} interviews, ${events.length} events`);
    console.log('✅ Data successfully exported to seed-data.json');

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

exportData();
