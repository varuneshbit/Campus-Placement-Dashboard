const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Student = require('./models/Student');
const Company = require('./models/Company');
const PlacementDrive = require('./models/PlacementDrive');
const Interview = require('./models/Interview');
const Event = require('./models/Event');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/placementDB');
    console.log('MongoDB Connected...');

    // Load exported data
    const dataPath = path.join(__dirname, 'seed-data.json');
    if (!fs.existsSync(dataPath)) {
      console.error('❌ seed-data.json not found. Please ensure it exists in the server/ directory.');
      process.exit(1);
    }

    const { users, students, companies, drives, interviews, events } = JSON.parse(
      fs.readFileSync(dataPath, 'utf-8')
    );

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Company.deleteMany({});
    await PlacementDrive.deleteMany({});
    await Interview.deleteMany({});
    await Event.deleteMany({});
    console.log('✅ Collections cleared');

    // Insert in dependency order
    // Passwords in the export are already bcrypt-hashed — insert directly
    await User.insertMany(users);
    console.log(`✅ Users inserted: ${users.length}`);

    await Company.insertMany(companies);
    console.log(`✅ Companies inserted: ${companies.length}`);

    await Student.insertMany(students);
    console.log(`✅ Students inserted: ${students.length}`);

    await PlacementDrive.insertMany(drives);
    console.log(`✅ Drives inserted: ${drives.length}`);

    await Interview.insertMany(interviews);
    console.log(`✅ Interviews inserted: ${interviews.length}`);

    await Event.insertMany(events);
    console.log(`✅ Events inserted: ${events.length}`);

    console.log('');
    console.log('🎉 Database seeded successfully from seed-data.json');
    console.log('');
    console.log('🔑 Default Admin Login : admin@placemate.edu  /  Admin@1234');
    console.log('🔑 Student Login       : <student-email>      /  Student@1234');
    console.log('');
    console.log('ℹ️  Note: All IDs and references are preserved from the original database.');

    mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedDatabase();
