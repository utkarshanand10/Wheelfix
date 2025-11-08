require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Service = require('../models/serviceModel');
const Brand = require('../models/brandModel');
const Settings = require('../models/settingsModel');

const connectDB = async () => {
  try {
    console.log('MONGODB_URL:', process.env.MONGODB_URL);
    if (!process.env.MONGODB_URL) {
      throw new Error('MONGODB_URL environment variable is not set');
    }
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    await connectDB();

    // Create superadmin user
    const superAdminData = {
      name: 'Super Admin',
      email: 'superadmin@wheelyfix.com',
      password: 'ChangeMe123!',
      phoneNumber: '9876543210',
      role: 'superadmin',
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
      isAdmin: true,
    };

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ email: superAdminData.email });
    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      return;
    }

    // Create superadmin
    const superAdmin = new User(superAdminData);
    await superAdmin.save();
    console.log('Super admin created successfully');

    // Create sample admin user
    const adminData = {
      name: 'Admin User',
      email: 'admin@wheelyfix.com',
      password: 'Admin123!',
      phoneNumber: '9876543211',
      role: 'admin',
      permissions: [
        'manage_users',
        'manage_services',
        'manage_products',
        'manage_brands',
        'manage_orders',
        'view_reports'
      ],
      status: 'active',
      isAdmin: true,
    };

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (!existingAdmin) {
      const admin = new User(adminData);
      await admin.save();
      console.log('Admin user created successfully');
    }

    // Create sample manager user
    const managerData = {
      name: 'Manager User',
      email: 'manager@wheelyfix.com',
      password: 'Manager123!',
      phoneNumber: '9876543212',
      role: 'manager',
      permissions: [
        'manage_services',
        'manage_products',
        'view_reports'
      ],
      status: 'active',
      isAdmin: true,
    };

    const existingManager = await User.findOne({ email: managerData.email });
    if (!existingManager) {
      const manager = new User(managerData);
      await manager.save();
      console.log('Manager user created successfully');
    }

    // Create sample services
    const sampleServices = [
      {
        title: 'Engine Oil Change',
        description: 'Complete engine oil change service with high-quality oil and filter replacement.',
        shortDescription: 'Professional engine oil change service',
        price: 1500,
        durationMinutes: 60,
        category: 'Engine Service',
        status: 'active',
        featured: true,
        popular: true,
        createdBy: superAdmin._id,
        icon: '🛢️',
        includes: [
          'High-quality engine oil',
          'Oil filter replacement',
          'Engine inspection',
          'Free car wash'
        ],
        requirements: [
          'Vehicle should be in running condition',
          'Previous service records if available'
        ],
        warranty: {
          duration: 3,
          unit: 'months',
          description: '3 months or 5000 km warranty on service'
        }
      },
      {
        title: 'Brake Service',
        description: 'Complete brake system inspection and service including brake pads, discs, and fluid check.',
        shortDescription: 'Complete brake system service',
        price: 2500,
        durationMinutes: 90,
        category: 'Brake Service',
        status: 'active',
        featured: true,
        popular: true,
        createdBy: superAdmin._id,
        icon: '🛑',
        includes: [
          'Brake pad inspection',
          'Brake disc check',
          'Brake fluid replacement',
          'Brake system cleaning'
        ],
        requirements: [
          'Vehicle should be in running condition',
          'Brake system should not be completely worn out'
        ],
        warranty: {
          duration: 6,
          unit: 'months',
          description: '6 months or 10000 km warranty on brake service'
        }
      },
      {
        title: 'AC Service',
        description: 'Complete air conditioning system service including gas refill, filter cleaning, and performance check.',
        shortDescription: 'Complete AC system service',
        price: 2000,
        durationMinutes: 75,
        category: 'Electrical Service',
        status: 'active',
        featured: false,
        popular: true,
        createdBy: superAdmin._id,
        icon: '❄️',
        includes: [
          'AC gas refill',
          'AC filter cleaning',
          'AC performance check',
          'AC system sanitization'
        ],
        requirements: [
          'Vehicle should be in running condition',
          'AC system should be functional'
        ],
        warranty: {
          duration: 3,
          unit: 'months',
          description: '3 months warranty on AC service'
        }
      },
      {
        title: 'Battery Service',
        description: 'Battery health check, terminal cleaning, and replacement if needed.',
        shortDescription: 'Battery health check and service',
        price: 800,
        durationMinutes: 30,
        category: 'Electrical Service',
        status: 'active',
        featured: false,
        popular: false,
        createdBy: superAdmin._id,
        icon: '🔋',
        includes: [
          'Battery health check',
          'Terminal cleaning',
          'Battery replacement if needed',
          'Charging system check'
        ],
        requirements: [
          'Vehicle should be accessible',
          'Battery should be accessible'
        ],
        warranty: {
          duration: 12,
          unit: 'months',
          description: '12 months warranty on new battery'
        }
      },
      {
        title: 'General Service',
        description: 'Comprehensive vehicle service including oil change, filter replacement, and general inspection.',
        shortDescription: 'Comprehensive vehicle service',
        price: 3000,
        durationMinutes: 120,
        category: 'General Service',
        status: 'active',
        featured: true,
        popular: true,
        createdBy: superAdmin._id,
        icon: '🔧',
        includes: [
          'Engine oil change',
          'Air filter replacement',
          'Fuel filter check',
          'General inspection',
          'Free car wash'
        ],
        requirements: [
          'Vehicle should be in running condition',
          'Previous service records if available'
        ],
        warranty: {
          duration: 6,
          unit: 'months',
          description: '6 months or 10000 km warranty on general service'
        }
      }
    ];

    for (const serviceData of sampleServices) {
      const existingService = await Service.findOne({ title: serviceData.title });
      if (!existingService) {
        const service = new Service(serviceData);
        await service.save();
        console.log(`Service "${serviceData.title}" created successfully`);
      }
    }

    // Create sample brands
    const sampleBrands = [
      {
        type: 'bike',
        name: 'Honda',
        slug: 'honda',
        logo: '/logos/honda.svg',
        models: [
          { name: 'Activa', fuels: ['petrol'] },
          { name: 'Shine', fuels: ['petrol'] },
          { name: 'Unicorn', fuels: ['petrol'] }
        ]
      },
      {
        type: 'bike',
        name: 'Yamaha',
        slug: 'yamaha',
        logo: '/logos/yamaha.svg',
        models: [
          { name: 'FZ', fuels: ['petrol'] },
          { name: 'R15', fuels: ['petrol'] },
          { name: 'MT-15', fuels: ['petrol'] }
        ]
      },
      {
        type: 'bike',
        name: 'Bajaj',
        slug: 'bajaj',
        logo: '/logos/bajaj.svg',
        models: [
          { name: 'Pulsar', fuels: ['petrol'] },
          { name: 'Discover', fuels: ['petrol'] },
          { name: 'Avenger', fuels: ['petrol'] }
        ]
      },
      {
        type: 'bike',
        name: 'TVS',
        slug: 'tvs',
        logo: '/logos/tvs.svg',
        models: [
          { name: 'Apache', fuels: ['petrol'] },
          { name: 'Jupiter', fuels: ['petrol'] },
          { name: 'Ntorq', fuels: ['petrol'] }
        ]
      },
      {
        type: 'bike',
        name: 'Royal Enfield',
        slug: 'royal-enfield',
        logo: '/logos/royal-enfield.svg',
        models: [
          { name: 'Classic 350', fuels: ['petrol'] },
          { name: 'Bullet 350', fuels: ['petrol'] },
          { name: 'Himalayan', fuels: ['petrol'] }
        ]
      }
    ];

    for (const brandData of sampleBrands) {
      const existingBrand = await Brand.findOne({ name: brandData.name });
      if (!existingBrand) {
        const brand = new Brand(brandData);
        await brand.save();
        console.log(`Brand "${brandData.name}" created successfully`);
      }
    }

    // Create default settings
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      const defaultSettings = new Settings({
        company: {
          name: 'WheelyFix',
          description: 'Your trusted automotive service partner',
          tagline: 'Quality Service, Every Time',
          website: 'https://wheelyfix.in',
          email: 'info@wheelyfix.in',
          phone: '+91-9876543210',
          address: {
            street: '123 Service Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India'
          }
        },
        business: {
          hours: {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '09:00', close: '16:00', closed: false },
            sunday: { open: '10:00', close: '14:00', closed: false }
          },
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          currencySymbol: '₹',
          maintenanceMode: false
        },
        features: {
          userRegistration: true,
          guestCheckout: true,
          wishlist: true,
          reviews: true,
          notifications: true,
          darkMode: true,
          multiLanguage: false
        },
        updatedBy: superAdmin._id
      });

      await defaultSettings.save();
      console.log('Default settings created successfully');
    }

    console.log('\n=== SEED COMPLETED SUCCESSFULLY ===');
    console.log('Admin credentials:');
    console.log('Super Admin: superadmin@wheelyfix.com / ChangeMe123!');
    console.log('Admin: admin@wheelyfix.com / Admin123!');
    console.log('Manager: manager@wheelyfix.com / Manager123!');
    console.log('\nAdmin Panel URL: http://localhost:3000/admin');
    console.log('=====================================');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the seed function
seedAdmin();