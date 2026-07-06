const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const Bed = require('./models/Bed');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Announcement = require('./models/Announcement');
const Log = require('./models/Log');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding...');

    // 1. Clear existing data
    await Admin.deleteMany({});
    await Bed.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Announcement.deleteMany({});
    await Log.deleteMany({});
    console.log('Cleared existing collections.');

    // 2. Seed Admins
    const admins = [
      { username: 'vasanthadmin123', password: 'vasanthadmin123' },
      { username: 'kavyaadmin123', password: 'kavyaadmin123' }
    ];
    await Admin.create(admins);
    console.log('Seeded Admins: vasanthadmin123, kavyaadmin123');

    // 3. Seed Doctors
    const doctors = [
      {
        id: 'DOC101',
        name: 'Dr. John Doe',
        phone: '9876543210',
        email: 'john.doe@vkhospital.com',
        specialization: 'Cardiology',
        password: 'password123' // Will be hashed by pre-save
      },
      {
        id: 'DOC102',
        name: 'Dr. Sarah Smith',
        phone: '8765432109',
        email: 'sarah.smith@vkhospital.com',
        specialization: 'Neurology',
        password: 'password123'
      },
      {
        id: 'DOC103',
        name: 'Dr. David Miller',
        phone: '7654321098',
        email: 'david.miller@vkhospital.com',
        specialization: 'Pediatrics',
        password: 'password123'
      },
      {
        id: 'DOC104',
        name: 'Dr. Emma Watson',
        phone: '6543210987',
        email: 'emma.watson@vkhospital.com',
        specialization: 'Emergency Medicine',
        password: 'password123'
      }
    ];
    await Doctor.create(doctors);
    console.log('Seeded Initial Doctors.');

    // 4. Seed Beds
    const beds = [];

    // Helper to generate beds for a floor/ward
    const createBedsForFloor = (floorName, prefix, count, wardName, startNum = 1) => {
      const statuses = ['Available', 'Available', 'Available', 'Available', 'Cleaning', 'Maintenance', 'Reserved'];
      for (let i = 0; i < count; i++) {
        const bedNum = startNum + i;
        // Distribute some statuses for a realistic UI load on start
        let status = 'Available';
        if (floorName === 'ICU' && bedNum === 1) status = 'Cleaning';
        if (floorName === 'Emergency' && bedNum === 2) status = 'Maintenance';
        if (floorName === 'VIP' && bedNum === 1) status = 'Reserved';

        beds.push({
          id: `B-${prefix}-${bedNum}`,
          bedNumber: `${prefix}-${bedNum}`,
          floor: floorName,
          ward: wardName,
          status: status,
          patientId: null
        });
      }
    };

    createBedsForFloor('Ground', 'G', 8, 'General Medicine Ward');
    createBedsForFloor('First', 'F', 8, 'Orthopedics Ward');
    createBedsForFloor('Second', 'S', 8, 'Neurology Ward');
    createBedsForFloor('Third', 'T', 8, 'Pediatric Ward');
    createBedsForFloor('ICU', 'ICU', 8, 'Intensive Care Unit');
    createBedsForFloor('Emergency', 'ER', 8, 'Emergency Wing');
    createBedsForFloor('VIP', 'VIP', 4, 'Premium Luxury Suite');
    createBedsForFloor('General Ward', 'GW', 12, 'Common General Ward');

    await Bed.create(beds);
    console.log(`Seeded ${beds.length} beds across all floors.`);

    // 5. Seed Announcements
    const announcements = [
      {
        title: 'VK Hospital Annual Free Health Camp',
        content: 'Join us on Sunday, July 12th, 2026, for a free multi-specialty check-up camp from 9:00 AM to 4:00 PM. Registration is free for all citizens.'
      },
      {
        title: 'New ICU Ventilators Upgraded',
        content: 'We have successfully integrated 10 state-of-the-art ICU ventilator systems to enhance high-dependency care and patient support.'
      },
      {
        title: 'Visitor Hours Policy Update',
        content: 'To prioritize patient recovery, visitors are restricted to 1 attendee per patient during 4:00 PM to 6:00 PM. Thank you for your cooperation.'
      }
    ];
    await Announcement.create(announcements);
    console.log('Seeded Initial Announcements.');

    // 6. Seed Log
    await Log.create({
      type: 'System',
      message: 'VK Hospital Patient Flow Management System Initialized.',
      user: 'System Setup'
    });
    console.log('Seeded Initial Log.');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
