const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Service = require('../models/serviceModel');

// Service pricing configuration (in paise)
const SERVICE_PRICING = {
  // Core Services
  car_services: {
    name: 'Car Services',
    price: 200000, // ₹2000
    description: 'General car maintenance including oil change, filter replacement, and basic inspection',
    duration: '2-3 hours',
    category: 'Maintenance',
    icon: '🚗'
  },
  ac_service: {
    name: 'AC Service & Repair',
    price: 150000, // ₹1500
    description: 'Air conditioning system cleaning, gas refill, and performance check',
    duration: '2-3 hours',
    category: 'Electrical',
    icon: '❄️'
  },
  battery_service: {
    name: 'Batteries',
    price: 100000, // ₹1000
    description: 'Battery testing, terminal cleaning, and replacement if needed',
    duration: '1-2 hours',
    category: 'Electrical',
    icon: '🔋'
  },
  tyres_wheel: {
    name: 'Tyres & Wheel Care',
    price: 250000, // ₹2500
    description: 'Tire rotation, wheel alignment, balancing, and tire replacement',
    duration: '2-4 hours',
    category: 'Wheels',
    icon: '🛞'
  },
  denting_painting: {
    name: 'Denting & Painting',
    price: 800000, // ₹8000
    description: 'Body repair, dent removal, and professional painting services',
    duration: '3-5 days',
    category: 'Bodywork',
    icon: '🎨'
  },
  detailing: {
    name: 'Detailing Services',
    price: 300000, // ₹3000
    description: 'Complete car detailing including interior and exterior cleaning',
    duration: '4-6 hours',
    category: 'Cleaning',
    icon: '✨'
  },
  car_spa: {
    name: 'Car Spa & Cleaning',
    price: 200000, // ₹2000
    description: 'Premium car washing, waxing, and interior deep cleaning',
    duration: '2-3 hours',
    category: 'Cleaning',
    icon: '🧽'
  },
  inspection: {
    name: 'Car Inspections',
    price: 150000, // ₹1500
    description: 'Comprehensive vehicle inspection and safety check',
    duration: '1-2 hours',
    category: 'Inspection',
    icon: '📋',
    isNew: true
  },
  windshields_lights: {
    name: 'Windshields & Lights',
    price: 180000, // ₹1800
    description: 'Windshield repair, headlight restoration, and bulb replacement',
    duration: '2-3 hours',
    category: 'Electrical',
    icon: '💡'
  },
  suspension_fitments: {
    name: 'Suspension & Fitments',
    price: 400000, // ₹4000
    description: 'Shock absorber check, suspension alignment, and ride quality assessment',
    duration: '3-4 hours',
    category: 'Suspension',
    icon: '🔧'
  },
  clutch_body_parts: {
    name: 'Clutch & Body Parts',
    price: 600000, // ₹6000
    description: 'Clutch repair, body part replacement, and mechanical repairs',
    duration: '4-6 hours',
    category: 'Mechanical',
    icon: '⚙️',
    isNew: true
  },
  insurance_claims: {
    name: 'Insurance Claims',
    price: 50000, // ₹500
    description: 'Assistance with insurance claims and documentation',
    duration: '1-2 hours',
    category: 'Administrative',
    icon: '🛡️'
  },
  
  // Two Wheeler Services
  tw_suspension: {
    name: 'Suspension',
    price: 150000, // ₹1500
    description: 'Shock absorber repair and suspension tuning',
    duration: '2-3 hours',
    category: 'Two Wheeler',
    icon: '🔧'
  },
  tw_body_finish: {
    name: 'Body Finish',
    price: 80000, // ₹800
    description: 'Paint touch-up and body panel restoration',
    duration: '1-2 hours',
    category: 'Two Wheeler',
    icon: '🎨'
  },
  tw_light_parts: {
    name: 'Light Parts',
    price: 60000, // ₹600
    description: 'Headlight, taillight, and indicator repairs',
    duration: '1 hour',
    category: 'Two Wheeler',
    icon: '💡'
  },
  tw_tyre_service: {
    name: 'Tyre Service',
    price: 120000, // ₹1200
    description: 'Tire replacement, puncture repair, and balancing',
    duration: '1-2 hours',
    category: 'Two Wheeler',
    icon: '🛞'
  },
  tw_electricals: {
    name: 'Electricals Services',
    price: 100000, // ₹1000
    description: 'Wiring, battery, and electrical system repairs',
    duration: '2-3 hours',
    category: 'Two Wheeler',
    icon: '⚡'
  },
  tw_body_parts: {
    name: 'Body Parts',
    price: 200000, // ₹2000
    description: 'Fairing, panels, and body component replacement',
    duration: '3-4 hours',
    category: 'Two Wheeler',
    icon: '🔩'
  },
  tw_engines_carburetor: {
    name: 'Engines & Carburetor',
    price: 300000, // ₹3000
    description: 'Engine overhaul and carburetor tuning',
    duration: '4-6 hours',
    category: 'Two Wheeler',
    icon: '🏍️'
  },
  tw_service_repair: {
    name: 'Service & Repair',
    price: 150000, // ₹1500
    description: 'General maintenance and repair services',
    duration: '2-3 hours',
    category: 'Two Wheeler',
    icon: '🔧'
  },
  tw_transmission: {
    name: 'Transmission',
    price: 250000, // ₹2500
    description: 'Gearbox and clutch system repairs',
    duration: '3-4 hours',
    category: 'Two Wheeler',
    icon: '⚙️'
  },
  tw_ev_battery: {
    name: 'EV Battery',
    price: 500000, // ₹5000
    description: 'Electric vehicle battery service and replacement',
    duration: '2-3 hours',
    category: 'Two Wheeler',
    icon: '🔋'
  },
  tw_brake_wheel: {
    name: 'Brake & Wheel',
    price: 180000, // ₹1800
    description: 'Brake pad replacement and wheel maintenance',
    duration: '1-2 hours',
    category: 'Two Wheeler',
    icon: '🛑'
  },
  tw_chassis: {
    name: 'Chassis',
    price: 400000, // ₹4000
    description: 'Frame repair and chassis alignment',
    duration: '4-6 hours',
    category: 'Two Wheeler',
    icon: '🏗️'
  },
  tw_handle_bar: {
    name: 'Handle Bar',
    price: 70000, // ₹700
    description: 'Handlebar adjustment and replacement',
    duration: '1 hour',
    category: 'Two Wheeler',
    icon: '🛠️'
  },
  tw_motor: {
    name: 'Motor',
    price: 350000, // ₹3500
    description: 'Electric motor service and repair',
    duration: '3-4 hours',
    category: 'Two Wheeler',
    icon: '⚡'
  }
};

// @desc    Add service to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { serviceId, quantity = 1 } = req.body;
  const userId = req.user._id;

  if (!serviceId) {
    res.status(400);
    throw new Error('Service ID is required');
  }

  // Try to get service from database first
  let serviceDetails = null;
  
  // Check if serviceId is a MongoDB ObjectId (24 hex characters)
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(serviceId);
  
  if (isObjectId) {
    // Try to fetch from database
    const dbService = await Service.findById(serviceId);
    if (dbService && dbService.status === 'active' && dbService.visible) {
      // Format duration
      let durationStr = dbService.duration || '1-2 hours';
      if (dbService.durationMinutes) {
        const hours = Math.floor(dbService.durationMinutes / 60);
        const minutes = dbService.durationMinutes % 60;
        if (hours > 0 && minutes > 0) {
          durationStr = `${hours}h ${minutes}m`;
        } else if (hours > 0) {
          durationStr = `${hours}h`;
        } else {
          durationStr = `${minutes}m`;
        }
      }
      
      serviceDetails = {
        name: dbService.title || dbService.name || 'Service',
        price: dbService.price || 0,
        description: dbService.description || '',
        duration: durationStr,
        category: dbService.category || 'General Service',
        icon: dbService.icon || '🔧'
      };
    }
  }
  
  // Fallback to hardcoded SERVICE_PRICING if not found in database
  if (!serviceDetails) {
    serviceDetails = SERVICE_PRICING[serviceId];
    if (!serviceDetails) {
      res.status(400);
      throw new Error('Invalid service ID');
    }
  }

  try {
    // Check if service already exists in cart
    const existingCartItem = await Cart.findOne({ userId, serviceId });

    if (existingCartItem) {
      // Update quantity if service already exists
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      
      res.json({
        success: true,
        message: 'Service quantity updated in cart',
        cartItem: existingCartItem
      });
    } else {
      // Add new service to cart
      const cartItem = await Cart.create({
        userId,
        serviceId,
        serviceName: serviceDetails.name,
        serviceType: serviceId,
        price: serviceDetails.price,
        quantity,
        description: serviceDetails.description,
        duration: serviceDetails.duration
      });

      res.status(201).json({
        success: true,
        message: 'Service added to cart',
        cartItem
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - service already in cart
      res.status(400);
      throw new Error('Service already exists in cart');
    }
    throw error;
  }
});

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cartItems = await Cart.find({ userId }).sort({ addedAt: -1 });

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  res.json({
    success: true,
    cartItems,
    summary: {
      totalItems,
      subtotal, // in paise
      subtotalInRupees: subtotal / 100
    }
  });
});

// @desc    Remove service from cart
// @route   DELETE /api/cart/remove/:id
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const cartItem = await Cart.findOne({ _id: id, userId });

  if (!cartItem) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  await Cart.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Service removed from cart'
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:id
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Valid quantity is required');
  }

  const cartItem = await Cart.findOne({ _id: id, userId });

  if (!cartItem) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  cartItem.quantity = quantity;
  await cartItem.save();

  res.json({
    success: true,
    message: 'Cart item updated',
    cartItem
  });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Cart.deleteMany({ userId });

  res.json({
    success: true,
    message: 'Cart cleared successfully'
  });
});

// @desc    Get available services
// @route   GET /api/cart/services
// @access  Public
const getAvailableServices = asyncHandler(async (req, res) => {
  try {
    // Fetch active and visible services from database
    // Only return services that are active, visible, and not archived
    const dbServices = await Service.find({
      status: 'active',
      visible: true
    })
    .select('_id title description price durationMinutes duration category icon type status visible popular createdAt')
    .sort({ createdAt: -1 })
    .lean();

    // Transform database services to match client-expected format
    const services = dbServices.map((service) => {
      // Use _id as the service id
      const serviceId = service._id.toString();
      
      // Determine if service is new (created in last 7 days)
      const createdAt = service.createdAt || new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const isNew = new Date(createdAt) > sevenDaysAgo;

      // Format duration - use durationMinutes if available, otherwise use duration string
      let durationStr = service.duration || '1-2 hours';
      if (service.durationMinutes) {
        const hours = Math.floor(service.durationMinutes / 60);
        const minutes = service.durationMinutes % 60;
        if (hours > 0 && minutes > 0) {
          durationStr = `${hours}h ${minutes}m`;
        } else if (hours > 0) {
          durationStr = `${hours}h`;
        } else {
          durationStr = `${minutes}m`;
        }
      }

      return {
        id: serviceId,
        name: service.title || service.name || 'Service',
        price: service.price || 0, // Price in paise (smallest currency unit)
        priceInRupees: (service.price || 0) / 100, // Price in rupees for display
        description: service.description || '',
        duration: durationStr,
        category: service.category || 'General Service',
        icon: service.icon || '🔧',
        isNew: isNew || service.popular || false
      };
    });

    // If no services found in database, fallback to hardcoded SERVICE_PRICING
    // This ensures backward compatibility during migration
    if (services.length === 0) {
      console.warn('No services found in database, falling back to hardcoded SERVICE_PRICING');
      const fallbackServices = Object.entries(SERVICE_PRICING).map(([id, details]) => ({
        id,
        name: details.name,
        price: details.price,
        priceInRupees: details.price / 100,
        description: details.description,
        duration: details.duration,
        category: details.category,
        icon: details.icon,
        isNew: details.isNew || false
      }));
      
      return res.json({
        success: true,
        services: fallbackServices
      });
    }

    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Error fetching services from database:', error);
    
    // Fallback to hardcoded SERVICE_PRICING on error
    console.warn('Falling back to hardcoded SERVICE_PRICING due to error');
    const fallbackServices = Object.entries(SERVICE_PRICING).map(([id, details]) => ({
      id,
      name: details.name,
      price: details.price,
      priceInRupees: details.price / 100,
      description: details.description,
      duration: details.duration,
      category: details.category,
      icon: details.icon,
      isNew: details.isNew || false
    }));

    res.json({
      success: true,
      services: fallbackServices
    });
  }
});

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  getAvailableServices
};
