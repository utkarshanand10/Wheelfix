const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // Company Information
    company: {
      name: {
        type: String,
        required: true,
        default: 'WheelyFix',
        maxlength: [100, 'Company name cannot exceed 100 characters'],
      },
      logo: {
        url: String,
        alt: String,
      },
      description: String,
      website: String,
      email: {
        type: String,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
      },
      phone: {
        type: String,
        match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'],
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
      },
      socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String,
        youtube: String,
      },
    },
    
    // Business Hours
    businessHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: true } },
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
      },
    },
    
    // Payment Settings
    payment: {
      razorpay: {
        keyId: String,
        keySecret: String,
        webhookSecret: String,
        mode: {
          type: String,
          enum: ['test', 'live'],
          default: 'test',
        },
      },
      currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP'],
      },
      taxRate: {
        type: Number,
        default: 18,
        min: [0, 'Tax rate cannot be negative'],
        max: [100, 'Tax rate cannot exceed 100%'],
      },
      taxType: {
        type: String,
        enum: ['GST', 'VAT', 'Sales Tax', 'Other'],
        default: 'GST',
      },
      minimumOrderAmount: {
        type: Number,
        default: 0,
        min: [0, 'Minimum order amount cannot be negative'],
      },
    },
    
    // Email Settings
    email: {
      smtp: {
        host: String,
        port: Number,
        secure: Boolean,
        auth: {
          user: String,
          pass: String,
        },
      },
      from: {
        name: String,
        email: String,
      },
      templates: {
        welcome: String,
        orderConfirmation: String,
        orderShipped: String,
        orderDelivered: String,
        passwordReset: String,
      },
    },
    
    // Site Settings
    site: {
      title: {
        type: String,
        default: 'WheelyFix - Automotive Services',
        maxlength: [200, 'Site title cannot exceed 200 characters'],
      },
      description: {
        type: String,
        maxlength: [500, 'Site description cannot exceed 500 characters'],
      },
      keywords: [String],
      logo: {
        url: String,
        alt: String,
      },
      favicon: String,
      maintenanceMode: {
        type: Boolean,
        default: false,
      },
      maintenanceMessage: String,
      theme: {
        primaryColor: {
          type: String,
          default: '#3B82F6',
        },
        secondaryColor: {
          type: String,
          default: '#1E40AF',
        },
      },
    },
    
    // Feature Flags
    features: {
      userRegistration: {
        type: Boolean,
        default: true,
      },
      emailVerification: {
        type: Boolean,
        default: false,
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
      guestCheckout: {
        type: Boolean,
        default: true,
      },
      wishlist: {
        type: Boolean,
        default: true,
      },
      reviews: {
        type: Boolean,
        default: true,
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    
    // Notification Settings
    notifications: {
      email: {
        newOrder: { type: Boolean, default: true },
        orderUpdate: { type: Boolean, default: true },
        lowStock: { type: Boolean, default: true },
        newUser: { type: Boolean, default: true },
      },
      sms: {
        newOrder: { type: Boolean, default: false },
        orderUpdate: { type: Boolean, default: false },
        lowStock: { type: Boolean, default: false },
      },
      push: {
        newOrder: { type: Boolean, default: true },
        orderUpdate: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
      },
    },
    
    // SEO Settings
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      ogImage: String,
      twitterCard: String,
      googleAnalytics: String,
      googleTagManager: String,
      facebookPixel: String,
    },
    
    // Security Settings
    security: {
      passwordPolicy: {
        minLength: { type: Number, default: 8 },
        requireUppercase: { type: Boolean, default: true },
        requireLowercase: { type: Boolean, default: true },
        requireNumbers: { type: Boolean, default: true },
        requireSpecialChars: { type: Boolean, default: true },
      },
      sessionTimeout: {
        type: Number,
        default: 30, // minutes
      },
      maxLoginAttempts: {
        type: Number,
        default: 5,
      },
      lockoutDuration: {
        type: Number,
        default: 30, // minutes
      },
    },
    
    // Backup Settings
    backup: {
      enabled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily',
      },
      retention: {
        type: Number,
        default: 30, // days
      },
    },
    
    // Analytics Settings
    analytics: {
      enabled: {
        type: Boolean,
        default: true,
      },
      trackingId: String,
      conversionGoals: [{
        name: String,
        value: Number,
        currency: String,
      }],
    },
    
    // Last updated by
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

// Virtual for full company address
settingsSchema.virtual('company.fullAddress').get(function() {
  const addr = this.company.address;
  if (!addr) return '';
  
  const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country]
    .filter(part => part && part.trim());
  
  return parts.join(', ');
});

// Virtual for business hours display
settingsSchema.virtual('businessHours.display').get(function() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return days.map((day, index) => {
    const hours = this.businessHours[day];
    if (hours.closed) {
      return `${dayNames[index]}: Closed`;
    }
    return `${dayNames[index]}: ${hours.open} - ${hours.close}`;
  });
});

module.exports = mongoose.model('Settings', settingsSchema);