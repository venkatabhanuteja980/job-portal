require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jobportal.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin account already exists: ${adminEmail}`);
      console.log('Skipping seed. No changes made.');
    } else {
      const admin = await User.create({
        firstName: process.env.ADMIN_FIRST_NAME || 'Super',
        lastName: process.env.ADMIN_LAST_NAME || 'Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
        isVerified: true,
      });

      console.log('Admin account created successfully:');
      console.log(`  Name:  ${admin.fullName}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Role:  ${admin.role}`);
    }
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedAdmin();
