const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Company = require('./models/Company');
const PlacementDrive = require('./models/PlacementDrive');
const dotenv = require('dotenv');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany();
    await Company.deleteMany();
    await PlacementDrive.deleteMany();
    console.log('Cleared existing users, companies, and drives.');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@placement.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Varun Sharma',
        email: 'varun@placement.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Priya Patel',
        email: 'priya@placement.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Rahul Kumar',
        email: 'rahul@placement.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Ananya Singh',
        email: 'ananya@placement.com',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Karthik Iyer',
        email: 'karthik@placement.com',
        password: 'student123',
        role: 'student'
      }
    ]);

    console.log('Seeded Admin: admin@placement.com / admin123');
    console.log('Seeded Students: varun, priya, rahul, ananya, karthik @placement.com / student123');

    const companies = await Company.create([
      {
        companyName: 'Google',
        salary: '25 LPA',
        location: 'Bangalore, India',
        companyDescription: 'Google is a multinational technology company that specializes in Internet-related services and products.',
        hiringStats: {
          previousOffers: 12,
          lastHiringYear: '2023',
          topSkills: ['Data Structures', 'Algorithms', 'System Design']
        }
      },
      {
        companyName: 'Microsoft',
        salary: '22 LPA',
        location: 'Hyderabad, India',
        companyDescription: 'Microsoft Corporation is an American multinational technology corporation which produces computer software.',
        hiringStats: {
          previousOffers: 15,
          lastHiringYear: '2023',
          topSkills: ['C++', 'Cloud Computing', 'Problem Solving']
        }
      },
      {
        companyName: 'Amazon',
        salary: '28 LPA',
        location: 'Bangalore, India',
        companyDescription: 'Amazon is a multinational technology company focusing on e-commerce, cloud computing, and AI.',
        hiringStats: {
          previousOffers: 20,
          lastHiringYear: '2023',
          topSkills: ['Java', 'AWS', 'System Design']
        }
      },
      {
        companyName: 'TCS',
        salary: '7.5 LPA',
        location: 'Pan India',
        companyDescription: 'Tata Consultancy Services is an Indian multinational IT services and consulting company.',
        hiringStats: {
          previousOffers: 150,
          lastHiringYear: '2023',
          topSkills: ['Java', 'SQL', 'Aptitude']
        }
      }
    ]);

    await PlacementDrive.create([
      {
        driveName: 'Google Campus Hiring 2024',
        companyId: companies[0]._id,
        jobRole: 'Software Engineer',
        jobDescription: 'Build robust scalable backend systems at Google.',
        salary: '25 LPA',
        date: new Date('2024-05-15'),
        batch: '2024',
        eligibility: {
          minCGPA: 8.0,
          branches: ['Computer Science', 'Information Technology']
        },
        registrationStatus: 'open'
      },
      {
        driveName: 'TCS Digital Drive',
        companyId: companies[3]._id,
        jobRole: 'System Engineer - Digital',
        jobDescription: 'Develop enterprise digital applications.',
        salary: '7.5 LPA',
        date: new Date('2024-06-01'),
        batch: '2024',
        eligibility: {
          minCGPA: 6.0,
          branches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']
        },
        registrationStatus: 'open'
      }
    ]);

    console.log('Seeded Companies and Placement Drives successfully.');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
