const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing users
    await User.deleteMany();
    console.log('Cleared existing users.');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    await User.create([
      {
        name: 'Admin User',
        email: 'admin@placement.com',
        password: 'admin123', // User model handles hashing in pre-save if implemented
        role: 'admin'
      },
      {
        name: 'Student User',
        email: 'student@placement.com',
        password: 'student123',
        role: 'student'
      }
    ]);

    console.log('Seeded Admin: admin@placement.com / admin123');
    console.log('Seeded Student: student@placement.com / student123');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
