const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/userModel');
const Service = require('../models/serviceModel');
const Product = require('../models/productModel');
const Brand = require('../models/brandModel');
const Order = require('../models/orderModel');
const Settings = require('../models/settingsModel');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wheelyfix');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create superadmin user
const createSuperAdmin = async () => {
  try {
    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ email: 'superadmin@wheelyfix.com' });
    if (existingAdmin) {
      console.log('Superadmin already exists');
      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);
    
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'superadmin@wheelyfix.com',
      password: hashedPassword,
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
      isAdmin: true
    });

    await superAdmin.save();
    console.log('Superadmin created successfully');
    return superAdmin;
  } catch (error) {
    console.error('Error creating superadmin:', error);
    throw error;
  }
};

// Create sample brands
const createBrands = async () => {
  try {
    const brands = [
      {
        name: 'Honda',
        description: 'Leading manufacturer of motorcycles and scooters',
        logo: {
          url: '/uploads/honda-logo.png',
          alt: 'Honda Logo'
        },
        website: 'https://www.honda.com',
        email: 'info@honda.com',
        phone: '+91-1800-123-4567',
        address: {
          street: 'Honda Motorcycle & Scooter India Pvt. Ltd.',
          city: 'Gurgaon',
          state: 'Haryana',
          country: 'India',
          pincode: '122015'
        },
        status: 'active',
        featured: true
      },
      {
        name: 'Yamaha',
        description: 'Japanese manufacturer of motorcycles and marine products',
        logo: {
          url: '/uploads/yamaha-logo.png',
          alt: 'Yamaha Logo'
        },
        website: 'https://www.yamaha-motor.com',
        email: 'info@yamaha.com',
        phone: '+91-1800-123-4568',
        address: {
          street: 'Yamaha Motor India Pvt. Ltd.',
          city: 'Chennai',
          state: 'Tamil Nadu',
          country: 'India',
          pincode: '600032'
        },
        status: 'active',
        featured: true
      },
      {
        name: 'Bajaj',
        description: 'Indian multinational automotive manufacturer',
        logo: {
          url: '/uploads/bajaj-logo.png',
          alt: 'Bajaj Logo'
        },
        website: 'https://www.bajajauto.com',
        email: 'info@bajajauto.com',
        phone: '+91-1800-123-4569',
        address: {
          street: 'Bajaj Auto Ltd.',
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India',
          pincode: '411018'
        },
        status: 'active',
        featured: true
      },
      {
        name: 'TVS',
        description: 'Indian multinational motorcycle manufacturer',
        logo: {
          url: '/uploads/tvs-logo.png',
          alt: 'TVS Logo'
        },
        website: 'https://www.tvsmotor.com',
        email: 'info@tvsmotor.com',
        phone: '+91-1800-123-4570',
        address: {
          street: 'TVS Motor Company Ltd.',
          city: 'Chennai',
          state: 'Tamil Nadu',
          country: 'India',
          pincode: '600032'
        },
        status: 'active',
        featured: false
      },
      {
        name: 'Royal Enfield',
        description: 'Indian motorcycle manufacturer known for classic bikes',
        logo: {
          url: '/uploads/royal-enfield-logo.png',
          alt: 'Royal Enfield Logo'
        },
        website: 'https://www.royalenfield.com',
        email: 'info@royalenfield.com',
        phone: '+91-1800-123-4571',
        address: {
          street: 'Royal Enfield Ltd.',
          city: 'Chennai',
          state: 'Tamil Nadu',
          country: 'India',
          pincode: '600032'
        },
        status: 'active',
        featured: true
      }
    ];

    const createdBrands = [];
    for (const brandData of brands) {
      const existingBrand = await Brand.findOne({ name: brandData.name });
      if (!existingBrand) {
        const brand = new Brand(brandData);
        await brand.save();
        createdBrands.push(brand);
        console.log(`Brand created: ${brand.name}`);
      } else {
        createdBrands.push(existingBrand);
        console.log(`Brand already exists: ${brandData.name}`);
      }
    }

    return createdBrands;
  } catch (error) {
    console.error('Error creating brands:', error);
    throw error;
  }
};

// Create sample services
const createServices = async (superAdmin) => {
  try {
    const services = [
      {
        title: 'Engine Oil Change',
        description: 'Complete engine oil change with high-quality synthetic oil. Includes oil filter replacement and basic engine inspection.',
        shortDescription: 'Professional engine oil change service',
        price: 1200,
        durationMinutes: 60,
        category: 'Engine Service',
        subcategory: 'Oil Change',
        tags: ['engine', 'oil', 'maintenance', 'synthetic'],
        requirements: ['Valid vehicle registration', 'Service history'],
        includes: ['Engine oil change', 'Oil filter replacement', 'Engine inspection', 'Service report'],
        excludes: ['Engine repairs', 'Additional parts'],
        warranty: {
          duration: 3,
          unit: 'months',
          description: '3 months warranty on service'
        },
        status: 'active',
        featured: true,
        popular: true,
        createdBy: superAdmin._id
      },
      {
        title: 'Brake Pad Replacement',
        description: 'Complete brake pad replacement for front and rear wheels. Includes brake fluid check and brake system inspection.',
        shortDescription: 'Professional brake pad replacement',
        price: 2500,
        durationMinutes: 90,
        category: 'Brake Service',
        subcategory: 'Pad Replacement',
        tags: ['brake', 'safety', 'replacement', 'maintenance'],
        requirements: ['Valid vehicle registration', 'Previous service records'],
        includes: ['Brake pad replacement', 'Brake fluid check', 'Brake system inspection', 'Test drive'],
        excludes: ['Brake disc replacement', 'Brake line repairs'],
        warranty: {
          duration: 6,
          unit: 'months',
          description: '6 months warranty on brake pads'
        },
        status: 'active',
        featured: true,
        popular: true,
        createdBy: superAdmin._id
      },
      {
        title: 'Battery Replacement',
        description: 'Complete battery replacement with new battery installation. Includes battery testing and charging system check.',
        shortDescription: 'Professional battery replacement service',
        price: 3500,
        durationMinutes: 45,
        category: 'Electrical Service',
        subcategory: 'Battery',
        tags: ['battery', 'electrical', 'replacement', 'starting'],
        requirements: ['Valid vehicle registration', 'Old battery'],
        includes: ['New battery installation', 'Battery testing', 'Charging system check', 'Warranty card'],
        excludes: ['Alternator repair', 'Starter motor repair'],
        warranty: {
          duration: 12,
          unit: 'months',
          description: '12 months warranty on battery'
        },
        status: 'active',
        featured: false,
        popular: true,
        createdBy: superAdmin._id
      },
      {
        title: 'Tire Replacement',
        description: 'Complete tire replacement service with wheel balancing and alignment check. Includes tire pressure monitoring.',
        shortDescription: 'Professional tire replacement service',
        price: 4000,
        durationMinutes: 120,
        category: 'General Service',
        subcategory: 'Tire Service',
        tags: ['tire', 'replacement', 'balancing', 'alignment'],
        requirements: ['Valid vehicle registration', 'Old tires'],
        includes: ['Tire replacement', 'Wheel balancing', 'Alignment check', 'Pressure monitoring'],
        excludes: ['Wheel repair', 'Suspension repair'],
        warranty: {
          duration: 6,
          unit: 'months',
          description: '6 months warranty on tires'
        },
        status: 'active',
        featured: true,
        popular: false,
        createdBy: superAdmin._id
      },
      {
        title: 'Full Service',
        description: 'Comprehensive vehicle service including engine oil change, air filter replacement, spark plug check, brake inspection, and general maintenance.',
        shortDescription: 'Complete vehicle maintenance service',
        price: 5000,
        durationMinutes: 180,
        category: 'General Service',
        subcategory: 'Full Service',
        tags: ['full service', 'maintenance', 'comprehensive', 'inspection'],
        requirements: ['Valid vehicle registration', 'Service history', 'Vehicle inspection'],
        includes: ['Engine oil change', 'Air filter replacement', 'Spark plug check', 'Brake inspection', 'General maintenance', 'Service report'],
        excludes: ['Major repairs', 'Part replacements'],
        warranty: {
          duration: 6,
          unit: 'months',
          description: '6 months warranty on service'
        },
        status: 'active',
        featured: true,
        popular: true,
        createdBy: superAdmin._id
      }
    ];

    const createdServices = [];
    for (const serviceData of services) {
      const existingService = await Service.findOne({ title: serviceData.title });
      if (!existingService) {
        const service = new Service(serviceData);
        await service.save();
        createdServices.push(service);
        console.log(`Service created: ${service.title}`);
      } else {
        createdServices.push(existingService);
        console.log(`Service already exists: ${serviceData.title}`);
      }
    }

    return createdServices;
  } catch (error) {
    console.error('Error creating services:', error);
    throw error;
  }
};

// Create sample products
const createProducts = async (brands, superAdmin) => {
  try {
    const products = [
      {
        title: 'Honda Engine Oil 10W-30',
        sku: 'HON-EO-10W30-1L',
        description: 'High-quality synthetic engine oil for Honda motorcycles. Provides excellent protection and performance.',
        shortDescription: 'Synthetic engine oil for Honda bikes',
        price: 450,
        stock: 50,
        lowStockThreshold: 10,
        brand: brands[0]._id, // Honda
        category: 'Engine Parts',
        subcategory: 'Engine Oil',
        tags: ['engine oil', 'synthetic', 'honda', '10w30'],
        specifications: [
          { name: 'Viscosity', value: '10W-30', unit: '' },
          { name: 'Type', value: 'Synthetic', unit: '' },
          { name: 'Volume', value: '1', unit: 'Liter' }
        ],
        features: ['Synthetic formula', 'Excellent protection', 'Honda approved', 'Long-lasting'],
        warranty: {
          duration: 12,
          unit: 'months',
          description: '12 months warranty'
        },
        weight: { value: 0.9, unit: 'kg' },
        status: 'active',
        featured: true,
        popular: true,
        createdBy: superAdmin._id
      },
      {
        title: 'Yamaha Brake Pads - Front',
        sku: 'YAM-BP-FRONT-001',
        description: 'High-performance brake pads for Yamaha motorcycles. Provides excellent stopping power and durability.',
        shortDescription: 'Front brake pads for Yamaha bikes',
        price: 1200,
        stock: 25,
        lowStockThreshold: 5,
        brand: brands[1]._id, // Yamaha
        category: 'Brake Parts',
        subcategory: 'Brake Pads',
        tags: ['brake pads', 'front', 'yamaha', 'performance'],
        specifications: [
          { name: 'Type', value: 'Semi-metallic', unit: '' },
          { name: 'Position', value: 'Front', unit: '' },
          { name: 'Compatibility', value: 'Yamaha FZ Series', unit: '' }
        ],
        features: ['High-performance', 'Excellent stopping power', 'Durable', 'Easy installation'],
        warranty: {
          duration: 6,
          unit: 'months',
          description: '6 months warranty'
        },
        weight: { value: 0.3, unit: 'kg' },
        status: 'active',
        featured: true,
        popular: true,
        createdBy: superAdmin._id
      },
      {
        title: 'Bajaj Air Filter',
        sku: 'BAJ-AF-001',
        description: 'High-quality air filter for Bajaj motorcycles. Ensures clean air intake and optimal engine performance.',
        shortDescription: 'Air filter for Bajaj bikes',
        price: 350,
        stock: 40,
        lowStockThreshold: 8,
        brand: brands[2]._id, // Bajaj
        category: 'Engine Parts',
        subcategory: 'Air Filter',
        tags: ['air filter', 'bajaj', 'engine', 'performance'],
        specifications: [
          { name: 'Type', value: 'Paper element', unit: '' },
          { name: 'Compatibility', value: 'Bajaj Pulsar Series', unit: '' },
          { name: 'Filtration', value: '99.9%', unit: '' }
        ],
        features: ['High filtration efficiency', 'Easy replacement', 'Durable', 'OEM quality'],
        warranty: {
          duration: 6,
          unit: 'months',
          description: '6 months warranty'
        },
        weight: { value: 0.2, unit: 'kg' },
        status: 'active',
        featured: false,
        popular: true,
        createdBy: superAdmin._id
      },
      {
        title: 'TVS Spark Plug Set',
        sku: 'TVS-SP-SET-001',
        description: 'Complete spark plug set for TVS motorcycles. Ensures reliable ignition and smooth engine performance.',
        shortDescription: 'Spark plug set for TVS bikes',
        price: 280,
        stock: 60,
        lowStockThreshold: 12,
        brand: brands[3]._id, // TVS
        category: 'Engine Parts',
        subcategory: 'Spark Plugs',
        tags: ['spark plugs', 'tvs', 'ignition', 'engine'],
        specifications: [
          { name: 'Type', value: 'Iridium', unit: '' },
          { name: 'Quantity', value: '2', unit: 'pieces' },
          { name: 'Gap', value: '0.8', unit: 'mm' }
        ],
        features: ['Iridium technology', 'Long-lasting', 'Easy installation', 'Reliable ignition'],
        warranty: {
          duration: 12,
          unit: 'months',
          description: '12 months warranty'
        },
        weight: { value: 0.1, unit: 'kg' },
        status: 'active',
        featured: false,
        popular: false,
        createdBy: superAdmin._id
      },
      {
        title: 'Royal Enfield Chain Set',
        sku: 'RE-CS-001',
        description: 'Heavy-duty chain set for Royal Enfield motorcycles. Built for durability and smooth power transmission.',
        shortDescription: 'Chain set for Royal Enfield bikes',
        price: 1800,
        stock: 15,
        lowStockThreshold: 3,
        brand: brands[4]._id, // Royal Enfield
        category: 'Engine Parts',
        subcategory: 'Chain Set',
        tags: ['chain set', 'royal enfield', 'transmission', 'durable'],
        specifications: [
          { name: 'Type', value: 'O-ring chain', unit: '' },
          { name: 'Pitch', value: '15.875', unit: 'mm' },
          { name: 'Links', value: '120', unit: '' }
        ],
        features: ['Heavy-duty construction', 'O-ring sealed', 'Smooth operation', 'Long-lasting'],
        warranty: {
          duration: 6,
          unit: 'months',
          description: '6 months warranty'
        },
        weight: { value: 1.2, unit: 'kg' },
        status: 'active',
        featured: true,
        popular: false,
        createdBy: superAdmin._id
      }
    ];

    const createdProducts = [];
    for (const productData of products) {
      const existingProduct = await Product.findOne({ sku: productData.sku });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        createdProducts.push(product);
        console.log(`Product created: ${product.title}`);
      } else {
        createdProducts.push(existingProduct);
        console.log(`Product already exists: ${productData.title}`);
      }
    }

    return createdProducts;
  } catch (error) {
    console.error('Error creating products:', error);
    throw error;
  }
};

// Create sample orders
const createOrders = async (users, services, products, superAdmin) => {
  try {
    const orders = [
      {
        user: users[0]._id,
        items: [
          {
            type: 'service',
            itemId: services[0]._id,
            title: services[0].title,
            price: services[0].price,
            quantity: 1,
            total: services[0].price
          },
          {
            type: 'product',
            itemId: products[0]._id,
            title: products[0].title,
            price: products[0].price,
            quantity: 2,
            total: products[0].price * 2
          }
        ],
        subtotal: services[0].price + (products[0].price * 2),
        tax: {
          amount: (services[0].price + (products[0].price * 2)) * 0.18,
          rate: 18,
          type: 'GST'
        },
        total: (services[0].price + (products[0].price * 2)) * 1.18,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        billingAddress: {
          name: users[0].name,
          email: users[0].email,
          phone: users[0].phoneNumber,
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        shippingAddress: {
          name: users[0].name,
          email: users[0].email,
          phone: users[0].phoneNumber,
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        createdBy: superAdmin._id
      },
      {
        user: users[1]._id,
        items: [
          {
            type: 'service',
            itemId: services[1]._id,
            title: services[1].title,
            price: services[1].price,
            quantity: 1,
            total: services[1].price
          }
        ],
        subtotal: services[1].price,
        tax: {
          amount: services[1].price * 0.18,
          rate: 18,
          type: 'GST'
        },
        total: services[1].price * 1.18,
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        billingAddress: {
          name: users[1].name,
          email: users[1].email,
          phone: users[1].phoneNumber,
          street: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India'
        },
        createdBy: superAdmin._id
      }
    ];

    const createdOrders = [];
    for (const orderData of orders) {
      const order = new Order(orderData);
      await order.save();
      createdOrders.push(order);
      console.log(`Order created: ${order.orderNumber}`);
    }

    return createdOrders;
  } catch (error) {
    console.error('Error creating orders:', error);
    throw error;
  }
};

// Create default settings
const createSettings = async (superAdmin) => {
  try {
    const existingSettings = await Settings.findOne();
    if (existingSettings) {
      console.log('Settings already exist');
      return existingSettings;
    }

    const settings = new Settings({
      company: {
        name: 'WheelyFix',
        description: 'Your trusted automotive service partner',
        website: 'https://wheelyfix.in',
        email: 'info@wheelyfix.in',
        phone: '+91-9876543210',
        address: {
          street: '123 Service Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pincode: '400001'
        },
        socialMedia: {
          facebook: 'https://facebook.com/wheelyfix',
          twitter: 'https://twitter.com/wheelyfix',
          instagram: 'https://instagram.com/wheelyfix'
        }
      },
      payment: {
        razorpay: {
          keyId: 'rzp_test_1234567890',
          keySecret: 'test_secret_key',
          webhookSecret: 'test_webhook_secret',
          mode: 'test'
        },
        currency: 'INR',
        taxRate: 18,
        taxType: 'GST',
        minimumOrderAmount: 0
      },
      email: {
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: 'noreply@wheelyfix.in',
            pass: 'your_app_password'
          }
        },
        from: {
          name: 'WheelyFix',
          email: 'noreply@wheelyfix.in'
        }
      },
      site: {
        title: 'WheelyFix - Automotive Services',
        description: 'Professional automotive services for all your vehicle needs',
        keywords: ['automotive', 'service', 'repair', 'maintenance', 'bike', 'car'],
        maintenanceMode: false,
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF'
        }
      },
      features: {
        userRegistration: true,
        emailVerification: false,
        twoFactorAuth: false,
        guestCheckout: true,
        wishlist: true,
        reviews: true,
        notifications: true
      },
      notifications: {
        email: {
          newOrder: true,
          orderUpdate: true,
          lowStock: true,
          newUser: true
        },
        sms: {
          newOrder: false,
          orderUpdate: false,
          lowStock: false
        },
        push: {
          newOrder: true,
          orderUpdate: true,
          promotions: true
        }
      },
      updatedBy: superAdmin._id
    });

    await settings.save();
    console.log('Settings created successfully');
    return settings;
  } catch (error) {
    console.error('Error creating settings:', error);
    throw error;
  }
};

// Create sample users
const createUsers = async () => {
  try {
    const users = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phoneNumber: '9876543211',
        role: 'customer',
        status: 'active'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        phoneNumber: '9876543212',
        role: 'customer',
        status: 'active'
      },
      {
        name: 'Admin User',
        email: 'admin@wheelyfix.com',
        password: 'admin123',
        phoneNumber: '9876543213',
        role: 'admin',
        permissions: ['manage_services', 'manage_products', 'manage_orders'],
        status: 'active',
        isAdmin: true
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        await user.save();
        createdUsers.push(user);
        console.log(`User created: ${user.name}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`User already exists: ${userData.name}`);
      }
    }

    return createdUsers;
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Starting database seeding...');

    // Create superadmin
    const superAdmin = await createSuperAdmin();

    // Create other users
    const users = await createUsers();

    // Create brands
    const brands = await createBrands();

    // Create services
    const services = await createServices(superAdmin);

    // Create products
    const products = await createProducts(brands, superAdmin);

    // Create orders
    const orders = await createOrders(users, services, products, superAdmin);

    // Create settings
    const settings = await createSettings(superAdmin);

    console.log('\n=== Database Seeding Complete ===');
    console.log(`✅ Superadmin created: superadmin@wheelyfix.com / ChangeMe123!`);
    console.log(`✅ ${users.length} users created`);
    console.log(`✅ ${brands.length} brands created`);
    console.log(`✅ ${services.length} services created`);
    console.log(`✅ ${products.length} products created`);
    console.log(`✅ ${orders.length} orders created`);
    console.log(`✅ Settings configured`);
    console.log('\nYou can now access the admin panel at: http://localhost:3000/admin');
    console.log('Login with: superadmin@wheelyfix.com / ChangeMe123!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();
