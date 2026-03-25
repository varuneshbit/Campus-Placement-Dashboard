const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

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

    // Drop collections securely 
    await User.deleteMany({});
    await Student.deleteMany({});
    await Company.deleteMany({});
    await PlacementDrive.deleteMany({});
    await Interview.deleteMany({});
    await Event.deleteMany({});

    console.log('Collections cleared');

    // 1. Admin
    const adminUser = await User.create({
      name: "Placement Admin",
      email: "admin@placemate.edu",
      password: "Admin@1234",
      role: "admin"
    });

    // 2. Companies
    const companiesData = [
      { companyName: "TCS (Tata Consultancy Services)", industry: "IT Services", website: "https://www.tcs.com", companyDescription: "India's largest IT services company offering digital, cloud, and consulting solutions globally.", location: "Mumbai, India", salary: "Negotiable" },
      { companyName: "Infosys", industry: "IT Services", website: "https://www.infosys.com", companyDescription: "Global leader in next-generation digital services and consulting with presence in 50+ countries.", location: "Bengaluru, India", salary: "Negotiable" },
      { companyName: "Wipro", industry: "IT Services", website: "https://www.wipro.com", companyDescription: "Technology services and consulting company delivering solutions across 167 countries.", location: "Bengaluru, India", salary: "Negotiable" },
      { companyName: "Zoho Corporation", industry: "SaaS / Product", website: "https://www.zoho.com", companyDescription: "Indian SaaS company building business software — CRM, HR, Finance and 50+ products.", location: "Chennai, India", salary: "Negotiable" },
      { companyName: "Amazon India", industry: "E-Commerce / Cloud", website: "https://www.amazon.in", companyDescription: "Amazon's India operations spanning e-commerce, AWS, and logistics with large tech hiring.", location: "Bengaluru, India", salary: "Negotiable" },
      { companyName: "Cognizant", industry: "IT Services", website: "https://www.cognizant.com", companyDescription: "Multinational IT services company focusing on digital transformation and business process services.", location: "Chennai, India", salary: "Negotiable" },
      { companyName: "Freshworks", industry: "SaaS / Product", website: "https://www.freshworks.com", companyDescription: "Cloud-based customer engagement software company headquartered in San Mateo with R&D in Chennai.", location: "Chennai, India", salary: "Negotiable" },
      { companyName: "L&T Technology Services", industry: "Engineering R&D", website: "https://www.ltts.com", companyDescription: "Pure-play engineering services company offering ER&D solutions to global OEMs and technology companies.", location: "Vadodara, India", salary: "Negotiable" }
    ];
    
    const companies = await Company.insertMany(companiesData);

    // 3. Students
    const studentsData = [
      // ── REGISTERED STUDENTS
      { rollNumber: "CSE2021001", name: "Arjun Kumar", email: "arjun.kumar@college.edu", phone: "9876543210", branch: "CSE", batch: "2021", cgpa: 8.7, placementStatus: "Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript", "Git"], projects: [{ title: "E-Commerce Platform", description: "Full-stack MERN e-commerce app with Stripe payment integration and admin dashboard", techStack: ["React", "Node.js", "MongoDB", "Stripe"] }, { title: "Real-Time Chat App", description: "Real-time messaging app with rooms, typing indicators and file sharing", techStack: ["Socket.io", "React", "Express", "MongoDB"] }], resumeURL: "https://res.cloudinary.com/demo/raw/upload/arjun_resume.pdf", resumeAnalysis: { score: 82, strengths: ["Strong MERN stack expertise", "Good project portfolio with real-world apps"], weaknesses: ["No internship experience listed", "Missing certifications"], missingSkills: ["TypeScript", "Docker", "AWS"], suggestions: ["Add TypeScript to existing projects", "Get AWS Cloud Practitioner certified", "Mention any freelance work"] }, profileCompletionPct: 95 },
      { rollNumber: "CSE2021002", name: "Priya Sharma", email: "priya.sharma@college.edu", phone: "9876543211", branch: "CSE", batch: "2021", cgpa: 9.1, placementStatus: "Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Pandas", "Scikit-learn", "NumPy"], projects: [{ title: "Crop Disease Detection", description: "CNN model detecting 15 crop diseases from leaf images with 94.2% accuracy", techStack: ["Python", "TensorFlow"] }], resumeURL: "https://res.cloudinary.com/demo/raw/upload/priya_resume.pdf", profileCompletionPct: 98 },
      { rollNumber: "CSE2021003", name: "Rahul Verma", email: "rahul.verma@college.edu", phone: "9876543212", branch: "CSE", batch: "2021", cgpa: 8.3, placementStatus: "Not Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["Java", "Spring Boot", "MySQL", "REST APIs", "Hibernate", "Maven"], projects: [{ title: "Library Management System", description: "Full-featured library system with role-based access", techStack: ["Java", "Spring Boot"] }], resumeURL: "https://res.cloudinary.com/demo/raw/upload/rahul_resume.pdf", profileCompletionPct: 80 },
      { rollNumber: "CSE2021004", name: "Sneha Iyer", email: "sneha.iyer@college.edu", phone: "9876543213", branch: "CSE", batch: "2021", cgpa: 9.0, placementStatus: "Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["Flutter", "Dart", "Firebase", "React Native", "UI/UX", "Figma"], projects: [{ title: "Campus Connect App", description: "Mobile app for college event management", techStack: ["Flutter", "Firebase"] }], resumeURL: "https://res.cloudinary.com/demo/raw/upload/sneha_resume.pdf", profileCompletionPct: 92 },
      { rollNumber: "CSE2021005", name: "Vikram Nair", email: "vikram.nair@college.edu", phone: "9876543214", branch: "CSE", batch: "2021", cgpa: 7.8, placementStatus: "Not Placed", isBlocked: true, isRegistered: true, source: "self-register", skills: ["C++", "Data Structures", "Algorithms", "Python"], projects: [], resumeURL: "", profileCompletionPct: 55 },
      { rollNumber: "CSE2022001", name: "Ananya Gupta", email: "ananya.gupta@college.edu", phone: "9876543215", branch: "CSE", batch: "2022", cgpa: 8.9, placementStatus: "Not Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["React", "TypeScript", "Next.js", "TailwindCSS"], projects: [], resumeURL: "https://res.cloudinary.com/demo/raw/upload/ananya_resume.pdf", profileCompletionPct: 90 },
      { rollNumber: "CSE2022002", name: "Karthik Menon", email: "karthik.menon@college.edu", phone: "9876543216", branch: "CSE", batch: "2022", cgpa: 8.5, placementStatus: "Not Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["Python", "Django", "PostgreSQL", "Redis", "Celery", "Docker"], projects: [], resumeURL: "https://res.cloudinary.com/demo/raw/upload/karthik_resume.pdf", profileCompletionPct: 85 },
      { rollNumber: "ECE2021001", name: "Meera Nair", email: "meera.nair@college.edu", phone: "9876543217", branch: "ECE", batch: "2021", cgpa: 9.2, placementStatus: "Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["Embedded C", "Arduino", "Raspberry Pi"], projects: [], resumeURL: "https://res.cloudinary.com/demo/raw/upload/meera_resume.pdf", profileCompletionPct: 93 },
      { rollNumber: "ECE2021002", name: "Suresh Babu", email: "suresh.babu@college.edu", phone: "9876543218", branch: "ECE", batch: "2021", cgpa: 7.5, placementStatus: "Not Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["VLSI", "Verilog", "MATLAB"], projects: [], resumeURL: "https://res.cloudinary.com/demo/raw/upload/suresh_resume.pdf", profileCompletionPct: 72 },
      { rollNumber: "ECE2021003", name: "Kavya Menon", email: "kavya.menon@college.edu", phone: "9876543219", branch: "ECE", batch: "2021", cgpa: 9.4, placementStatus: "Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["Python", "Signal Processing", "MATLAB"], projects: [], resumeURL: "https://res.cloudinary.com/demo/raw/upload/kavya_resume.pdf", profileCompletionPct: 97 },
      { rollNumber: "ECE2022001", name: "Rohit Pillai", email: "rohit.pillai@college.edu", phone: "9876543220", branch: "ECE", batch: "2022", cgpa: 8.1, placementStatus: "Not Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["React", "Node.js", "IoT", "Arduino"], projects: [], resumeURL: "https://res.cloudinary.com/demo/raw/upload/rohit_resume.pdf", profileCompletionPct: 78 },
      { rollNumber: "IT2021001", name: "Neha Agarwal", email: "neha.agarwal@college.edu", phone: "9876543221", branch: "IT", batch: "2021", cgpa: 9.3, placementStatus: "Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["Cybersecurity", "Ethical Hacking", "Python"], projects: [], resumeURL: "https://res.cloudinary.com/demo/raw/upload/neha_resume.pdf", profileCompletionPct: 96 },
      { rollNumber: "IT2021002", name: "Deepak Raj", email: "deepak.raj@college.edu", phone: "9876543222", branch: "IT", batch: "2021", cgpa: 8.0, placementStatus: "Not Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["PHP", "Laravel", "MySQL", "Vue.js"], projects: [], resumeURL: "https://res.cloudinary.com/demo/raw/upload/deepak_resume.pdf", profileCompletionPct: 82 },
      { rollNumber: "IT2021003", name: "Shruti Desai", email: "shruti.desai@college.edu", phone: "9876543223", branch: "IT", batch: "2021", cgpa: 8.6, placementStatus: "Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["AWS", "DevOps", "Docker", "Kubernetes"], projects: [], resumeURL: "https://res.cloudinary.com/demo/raw/upload/shruti_resume.pdf", profileCompletionPct: 91 },
      { rollNumber: "IT2022001", name: "Aditya Singh", email: "aditya.singh@college.edu", phone: "9876543224", branch: "IT", batch: "2022", cgpa: 8.4, placementStatus: "Not Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["Blockchain", "Solidity", "Ethereum"], projects: [], resumeURL: "https://res.cloudinary.com/demo/raw/upload/aditya_resume.pdf", profileCompletionPct: 87 },
      { rollNumber: "MECH2021001", name: "Varun Sharma", email: "varun.sharma@college.edu", phone: "9876543225", branch: "Mechanical", batch: "2021", cgpa: 9.2, placementStatus: "Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["AutoCAD", "SolidWorks", "ANSYS", "Python"], projects: [], resumeURL: "https://res.cloudinary.com/demo/raw/upload/varun_resume.pdf", profileCompletionPct: 88 },
      { rollNumber: "MECH2021002", name: "Pooja Krishnan", email: "pooja.krishnan@college.edu", phone: "9876543226", branch: "Mechanical", batch: "2021", cgpa: 7.9, placementStatus: "Not Placed", isBlocked: true, isRegistered: true, source: "self-register", skills: ["AutoCAD", "SolidWorks", "Manufacturing Processes"], projects: [], resumeURL: "", profileCompletionPct: 45 },
      { rollNumber: "MECH2022002", name: "Kiran Bedi", email: "kiran.bedi@college.edu", phone: "9876543236", branch: "Mechanical", batch: "2021", cgpa: 7.5, placementStatus: "Not Placed", isBlocked: false, isRegistered: true, source: "self-register", skills: ["Manufacturing"], projects: [], resumeURL: "", profileCompletionPct: 40 },
      
      // ── EXCEL-ONLY STUBS
      { rollNumber: "CSE2022003", name: "Shreya Sen", email: "shreya.sen@college.edu", phone: "", branch: "CSE", batch: "2022", cgpa: 9.0, placementStatus: "Not Placed", isBlocked: false, isRegistered: false, source: "excel", skills: [], projects: [], resumeURL: "", profileCompletionPct: 20 },
      { rollNumber: "ECE2022002", name: "Harish Kumar", email: "harish.kumar@college.edu", phone: "", branch: "ECE", batch: "2022", cgpa: 7.6, placementStatus: "Not Placed", isBlocked: false, isRegistered: false, source: "excel", skills: [], projects: [], resumeURL: "", profileCompletionPct: 20 },
      { rollNumber: "IT2022002", name: "Divya Patel", email: "divya.patel@college.edu", phone: "", branch: "IT", batch: "2022", cgpa: 8.2, placementStatus: "Not Placed", isBlocked: false, isRegistered: false, source: "excel", skills: [], projects: [], resumeURL: "", profileCompletionPct: 20 },
      { rollNumber: "MECH2022001", name: "Nikhil Joshi", email: "nikhil.joshi@college.edu", phone: "", branch: "Mechanical", batch: "2022", cgpa: 8.0, placementStatus: "Not Placed", isBlocked: false, isRegistered: false, source: "excel", skills: [], projects: [], resumeURL: "", profileCompletionPct: 20 },
      { rollNumber: "CSE2022004", name: "Ravi Teja", email: "ravi.teja@college.edu", phone: "", branch: "CSE", batch: "2022", cgpa: 7.3, placementStatus: "Not Placed", isBlocked: false, isRegistered: false, source: "excel", skills: [], projects: [], resumeURL: "", profileCompletionPct: 20 },
      { rollNumber: "ECE2021004", name: "Lakshmi Priya", email: "lakshmi.priya@college.edu", phone: "", branch: "ECE", batch: "2021", cgpa: 8.8, placementStatus: "Not Placed", isBlocked: false, isRegistered: false, source: "excel", skills: [], projects: [], resumeURL: "", profileCompletionPct: 20 },
      { rollNumber: "IT2021004", name: "Manoj Reddy", email: "manoj.reddy@college.edu", phone: "", branch: "IT", batch: "2021", cgpa: 7.7, placementStatus: "Not Placed", isBlocked: false, isRegistered: false, source: "excel", skills: [], projects: [], resumeURL: "", profileCompletionPct: 20 }
    ];

    const registeredStudentsMap = {};

    for (let student of studentsData) {
      if (student.isRegistered) {
        const user = await User.create({
          name: student.name,
          email: student.email,
          password: "Student@1234",
          role: "student"
        });
        student.userId = user._id;
        student.user = user._id;
      }
      
      const std = await Student.create(student);
      if (student.isRegistered) {
        registeredStudentsMap[student.rollNumber] = std._id;
      }
    }

    // 4. Drives
    const mapCompany = (name) => companies.find(c => c.companyName.includes(name))._id;
    
    const drivesData = [
      { driveName: "TCS Drive", companyId: mapCompany("TCS"), jobRole: "Systems Engineer", jobDescription: "Work on enterprise application development, maintenance and support.", eligibility: { minCGPA: 6.0, branches: ["CSE", "IT", "ECE"] }, salary: "3.36 LPA", date: new Date("2026-03-15T09:00:00"), batch: "2021", registrationStatus: "closed" },
      { driveName: "Infosys Drive", companyId: mapCompany("Infosys"), jobRole: "Systems Engineer Specialist", jobDescription: "Develop and maintain complex systems across cloud and ML.", eligibility: { minCGPA: 7.0, branches: ["CSE", "IT"] }, salary: "4.5 LPA", date: new Date("2026-03-22T09:00:00"), batch: "2021", registrationStatus: "closed" },
      { driveName: "Zoho Drive", companyId: mapCompany("Zoho"), jobRole: "Software Developer", jobDescription: "Build and scale Zoho's SaaS products.", eligibility: { minCGPA: 7.5, branches: ["CSE", "IT"] }, salary: "6.0 LPA", date: new Date("2026-04-10T09:00:00"), batch: "2021", registrationStatus: "open" },
      { driveName: "Amazon Drive", companyId: mapCompany("Amazon"), jobRole: "SDE-1", jobDescription: "Design and implement scalable software systems.", eligibility: { minCGPA: 8.0, branches: ["CSE"] }, salary: "24 LPA", date: new Date("2026-04-20T09:00:00"), batch: "2021", registrationStatus: "upcoming" },
      { driveName: "Freshworks Drive", companyId: mapCompany("Freshworks"), jobRole: "Associate Software Engineer", jobDescription: "Join Freshworks R&D.", eligibility: { minCGPA: 7.0, branches: ["CSE", "IT", "ECE"] }, salary: "8.0 LPA", date: new Date("2026-05-01T09:00:00"), batch: "2021", registrationStatus: "upcoming" },
      { driveName: "L&T Drive", companyId: mapCompany("L&T"), jobRole: "Graduate Engineer Trainee", jobDescription: "Engineering R&D roles.", eligibility: { minCGPA: 6.5, branches: ["ECE", "Mechanical", "IT"] }, salary: "4.0 LPA", date: new Date("2026-05-15T09:00:00"), batch: "2021", registrationStatus: "upcoming" }
    ];

    const drives = await PlacementDrive.insertMany(drivesData);

    const mapDrive = (name) => drives.find(d => d.driveName.includes(name))._id;

    // 5. Interviews
    const interviewsData = [
      { studentId: registeredStudentsMap["CSE2021001"], driveId: mapDrive("TCS"), interviewDate: new Date("2026-03-15T11:00:00"), round: "1", mode: "Online", status: "completed", result: "selected", feedback: "Excellent communication." },
      { studentId: registeredStudentsMap["CSE2021003"], driveId: mapDrive("TCS"), interviewDate: new Date("2026-03-15T12:00:00"), round: "1", mode: "Online", status: "completed", result: "rejected", feedback: "Good theoretical knowledge but struggled." },
      { studentId: registeredStudentsMap["CSE2021004"], driveId: mapDrive("TCS"), interviewDate: new Date("2026-03-15T14:00:00"), round: "1", mode: "Online", status: "completed", result: "selected", feedback: "Strong problem-solving." },
      { studentId: registeredStudentsMap["CSE2021002"], driveId: mapDrive("Infosys"), interviewDate: new Date("2026-03-22T10:00:00"), round: "1", mode: "Offline", status: "completed", result: "selected", feedback: "Outstanding ML knowledge." },
      { studentId: registeredStudentsMap["IT2021001"], driveId: mapDrive("Infosys"), interviewDate: new Date("2026-03-22T11:00:00"), round: "1", mode: "Offline", status: "completed", result: "selected", feedback: "Cybersecurity differentiator." },
      { studentId: registeredStudentsMap["CSE2022001"], driveId: mapDrive("Zoho"), interviewDate: new Date("2026-04-10T10:00:00"), round: "1", mode: "Online", status: "completed", result: "pending", feedback: "Awaiting round 2." },
      { studentId: registeredStudentsMap["CSE2022002"], driveId: mapDrive("Zoho"), interviewDate: new Date("2026-04-10T11:30:00"), round: "1", mode: "Online", status: "completed", result: "pending", feedback: "Round 2 pending." },
      { studentId: registeredStudentsMap["CSE2021001"], driveId: mapDrive("Amazon"), interviewDate: new Date("2026-04-20T10:00:00"), round: "1", mode: "Online", status: "scheduled", result: "pending", feedback: "" },
      { studentId: registeredStudentsMap["CSE2021002"], driveId: mapDrive("Amazon"), interviewDate: new Date("2026-04-20T14:00:00"), round: "1", mode: "Online", status: "scheduled", result: "pending", feedback: "" },
      { studentId: registeredStudentsMap["IT2022001"], driveId: mapDrive("Freshworks"), interviewDate: new Date("2026-05-01T09:00:00"), round: "1", mode: "Online", status: "scheduled", result: "pending", feedback: "" }
    ];

    await Interview.insertMany(interviewsData);

    // 6. Generate Events for Calendar
    const eventsData = [];
    
    for (let d of drivesData) {
      eventsData.push({
        title: `${d.driveName}`,
        description: `Placement Drive: ${d.jobDescription}`,
        start: d.date,
        end: new Date(new Date(d.date).getTime() + 8 * 60 * 60 * 1000),
        type: 'drive',
        createdBy: adminUser._id
      });
    }

    const resolveStudentName = (id) => {
        let theRoll = Object.keys(registeredStudentsMap).find(k => registeredStudentsMap[k].toString() === id.toString());
        return studentsData.find(s => s.rollNumber === theRoll)?.name || "Student";
    };

    for (let i of interviewsData) {
      let dName = drives.find(d => d._id.toString() === i.driveId.toString())?.driveName;
      eventsData.push({
        title: `Interview - ${resolveStudentName(i.studentId)}`,
        description: `Round ${i.round} for ${dName}`,
        start: i.interviewDate,
        end: new Date(new Date(i.interviewDate).getTime() + 1 * 60 * 60 * 1000),
        type: 'interview',
        createdBy: adminUser._id
      });
    }

    await Event.insertMany(eventsData);

    console.log('✅ Admin: 1');
    console.log('✅ Students: 25 (18 registered + 7 Excel stubs)');
    console.log('✅ Companies: 8');
    console.log('✅ Drives: 6');
    console.log('✅ Interviews: 10');
    console.log('✅ Events: ' + eventsData.length + ' (Auto-generated for Calendar)');
    console.log('');
    console.log('🔑 Admin Login: admin@placemate.edu / Admin@1234');
    console.log('🔑 Student Login: <student-email> / Student@1234');

    mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
