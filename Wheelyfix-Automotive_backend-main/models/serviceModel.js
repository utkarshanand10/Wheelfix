const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      default: '🔧',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    comparePrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      default: 60,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'General Service',
        'Engine Service',
        'Brake Service',
        'Suspension Service',
        'Electrical Service',
        'Body Work',
        'Interior Service',
        'Exterior Service',
        'Diagnostic',
        'Emergency',
        'Other'
      ],
      default: 'General Service',
    },
    subcategory: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    images: [{
      url: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
        default: '',
      },
      isPrimary: {
        type: Boolean,
        default: false,
      },
      order: {
        type: Number,
        default: 0,
      },
    }],
    requirements: [{
      type: String,
      trim: true,
    }],
    includes: [{
      type: String,
      trim: true,
    }],
    excludes: [{
      type: String,
      trim: true,
    }],
    warranty: {
      duration: {
        type: Number,
        default: 0,
      },
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months', 'years'],
        default: 'months',
      },
      description: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft', 'archived'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ['bike', 'car'],
      required: true,
      default: 'car',
    },
    duration: {
      type: String,
      default: '1-2 hours',
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Legacy field for backward compatibility
    name: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for better performance
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ category: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ featured: 1 });
serviceSchema.index({ popular: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ slug: 1 });

// Virtual for primary image
serviceSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual for duration in hours
serviceSchema.virtual('durationHours').get(function() {
  return Math.round((this.durationMinutes / 60) * 10) / 10;
});

// Pre-save middleware to generate slug
serviceSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Pre-save middleware to ensure only one primary image
serviceSchema.pre('save', function(next) {
  if (this.isModified('images')) {
    let primaryCount = 0;
    this.images.forEach((img, index) => {
      if (img.isPrimary) {
        primaryCount++;
        if (primaryCount > 1) {
          img.isPrimary = false;
        }
      }
      img.order = index;
    });
    
    // If no primary image, make the first one primary
    if (primaryCount === 0 && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);


