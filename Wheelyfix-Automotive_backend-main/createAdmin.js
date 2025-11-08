const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wheelyfix');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@wheelyfix.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      console.log('Updating admin user...');
      
      // Update the admin user with known password
      existingAdmin.password = 'admin123';
      existingAdmin.role = 'admin';
      existingAdmin.permissions = [
        'manage_users',
        'manage_services',
        'manage_products',
        'manage_brands',
        'manage_orders',
        'view_reports',
        'manage_settings',
        'manage_content',
        'manage_media'
      ];
      existingAdmin.status = 'active';
      existingAdmin.isVerified = true;
      
      await existingAdmin.save();
      console.log('Admin user updated successfully');
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Wheelyfix Admin',
      email: 'admin@wheelyfix.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      phoneNumber: '1234567890',
      role: 'admin',
      permissions: [
        'manage_users',
        'manage_services',
        'manage_products',
        'manage_brands',
        'manage_orders',
        'view_reports',
        'manage_settings',
        'manage_content',
        'manage_media'
      ],
      status: 'active',
      isVerified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully:');
    console.log('Email: admin@wheelyfix.com');
    console.log('Password: admin123');
    console.log('Role:', adminUser.role);
    console.log('Permissions:', adminUser.permissions);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdminUser();
