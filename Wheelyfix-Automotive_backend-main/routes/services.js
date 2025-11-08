/**
 * Unified Services API Routes
 * Provides endpoints for fetching services based on vehicle type (bike/car)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load services data from JSON files
const loadCarServicesData = () => {
  try {
    const servicesDataPath = path.join(__dirname, '../services.json');
    const servicesData = JSON.parse(fs.readFileSync(servicesDataPath, 'utf8'));
    return servicesData;
  } catch (error) {
    console.error('Error loading car services data:', error);
    throw new Error('Failed to load car services data');
  }
};

const loadBikeServicesData = () => {
  try {
    const bikeServicesDataPath = path.join(__dirname, '../bikeServices.json');
    const bikeServicesData = JSON.parse(fs.readFileSync(bikeServicesDataPath, 'utf8'));
    return bikeServicesData;
  } catch (error) {
    console.error('Error loading bike services data:', error);
    throw new Error('Failed to load bike services data');
  }
};

/**
 * POST /api/services
 * Returns services for a specific brand, model, and fuel type combination
 * Body: { brand: string, model: string, fuel: string, vehicleType: string }
 */
router.post('/', (req, res) => {
  try {
    const { brand, model, fuel, vehicleType } = req.body;
    
    // Validate required fields
    if (!brand || !model || !fuel) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide brand, model, and fuel.',
        required: ['brand', 'model', 'fuel']
      });
    }
    
    // Determine which services data to load based on vehicle type
    let servicesData;
    if (vehicleType && vehicleType.toLowerCase() === 'bike') {
      servicesData = loadBikeServicesData();
    } else {
      // Default to car services
      servicesData = loadCarServicesData();
    }
    
    // Check if services exist for the specified combination
    if (!servicesData[brand] || !servicesData[brand][model] || !servicesData[brand][model][fuel]) {
      return res.status(404).json({
        success: false,
        message: 'No services found for this selection.',
        data: {
          brand: brand,
          model: model,
          fuel: fuel,
          vehicleType: vehicleType || 'car',
          services: []
        }
      });
    }
    
    const services = servicesData[brand][model][fuel];
    
    // Calculate total statistics
    const totalPrice = services.reduce((sum, service) => sum + service.price, 0);
    const totalTime = services.reduce((sum, service) => sum + service.estimatedTime, 0);
    const categories = [...new Set(services.map(service => service.category))];
    
    res.json({
      success: true,
      message: `Services for ${brand} ${model} (${fuel}) retrieved successfully`,
      data: {
        vehicleInfo: {
          brand: brand,
          model: model,
          fuel: fuel,
          vehicleType: vehicleType || 'car'
        },
        services: services,
        statistics: {
          totalServices: services.length,
          totalPrice: totalPrice,
          totalTime: totalTime,
          categories: categories,
          priceRange: {
            min: Math.min(...services.map(s => s.price)),
            max: Math.max(...services.map(s => s.price))
          },
          timeRange: {
            min: Math.min(...services.map(s => s.estimatedTime)),
            max: Math.max(...services.map(s => s.estimatedTime))
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
});

/**
 * GET /api/services/categories
 * Returns all available service categories
 */
router.get('/categories', (req, res) => {
  try {
    const { vehicleType } = req.query;
    
    // Load appropriate services data based on vehicle type
    let servicesData;
    if (vehicleType && vehicleType.toLowerCase() === 'bike') {
      servicesData = loadBikeServicesData();
    } else {
      servicesData = loadCarServicesData();
    }
    
    const categories = new Set();
    
    // Extract all unique categories from the services data
    Object.values(servicesData).forEach(brand => {
      Object.values(brand).forEach(model => {
        Object.values(model).forEach(services => {
          services.forEach(service => {
            categories.add(service.category);
          });
        });
      });
    });
    
    const categoriesArray = Array.from(categories).sort();
    
    res.json({
      success: true,
      message: 'Service categories retrieved successfully',
      data: {
        categories: categoriesArray,
        count: categoriesArray.length,
        vehicleType: vehicleType || 'car'
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

/**
 * GET /api/services/search
 * Search services by category, price range, or time range
 * Query parameters: category, minPrice, maxPrice, minTime, maxTime
 */
router.get('/search', (req, res) => {
  try {
    const { category, minPrice, maxPrice, minTime, maxTime, vehicleType } = req.query;
    
    // Load appropriate services data based on vehicle type
    let servicesData;
    if (vehicleType && vehicleType.toLowerCase() === 'bike') {
      servicesData = loadBikeServicesData();
    } else {
      servicesData = loadCarServicesData();
    }
    
    let matchingServices = [];
    
    // Search through all services
    Object.keys(servicesData).forEach(brand => {
      Object.keys(servicesData[brand]).forEach(model => {
        Object.keys(servicesData[brand][model]).forEach(fuel => {
          const services = servicesData[brand][model][fuel];
          
          services.forEach(service => {
            let matches = true;
            
            // Filter by category
            if (category && service.category !== category) {
              matches = false;
            }
            
            // Filter by price range
            if (minPrice && service.price < parseInt(minPrice)) {
              matches = false;
            }
            if (maxPrice && service.price > parseInt(maxPrice)) {
              matches = false;
            }
            
            // Filter by time range
            if (minTime && service.estimatedTime < parseInt(minTime)) {
              matches = false;
            }
            if (maxTime && service.estimatedTime > parseInt(maxTime)) {
              matches = false;
            }
            
            if (matches) {
              matchingServices.push({
                ...service,
                vehicleInfo: {
                  brand: brand,
                  model: model,
                  fuel: fuel,
                  vehicleType: vehicleType || 'car'
                }
              });
            }
          });
        });
      });
    });
    
    res.json({
      success: true,
      message: 'Service search completed successfully',
      data: {
        services: matchingServices,
        count: matchingServices.length,
        searchParams: {
          category: category || null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          minTime: minTime || null,
          maxTime: maxTime || null,
          vehicleType: vehicleType || 'car'
        }
      }
    });
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search services',
      error: error.message
    });
  }
});

/**
 * GET /api/services/statistics
 * Returns overall statistics about the services data
 */
router.get('/statistics', (req, res) => {
  try {
    const { vehicleType } = req.query;
    
    // Load appropriate services data based on vehicle type
    let servicesData;
    if (vehicleType && vehicleType.toLowerCase() === 'bike') {
      servicesData = loadBikeServicesData();
    } else {
      servicesData = loadCarServicesData();
    }
    
    let totalServices = 0;
    let totalCombinations = 0;
    let allPrices = [];
    let allTimes = [];
    const categories = new Set();
    
    // Calculate statistics
    Object.keys(servicesData).forEach(brand => {
      Object.keys(servicesData[brand]).forEach(model => {
        Object.keys(servicesData[brand][model]).forEach(fuel => {
          const services = servicesData[brand][model][fuel];
          totalServices += services.length;
          totalCombinations++;
          
          services.forEach(service => {
            allPrices.push(service.price);
            allTimes.push(service.estimatedTime);
            categories.add(service.category);
          });
        });
      });
    });
    
    const stats = {
      vehicleType: vehicleType || 'car',
      totalBrands: Object.keys(servicesData).length,
      totalCombinations: totalCombinations,
      totalServices: totalServices,
      totalCategories: categories.size,
      priceStatistics: {
        min: Math.min(...allPrices),
        max: Math.max(...allPrices),
        average: Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
      },
      timeStatistics: {
        min: Math.min(...allTimes),
        max: Math.max(...allTimes),
        average: Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length)
      }
    };
    
    res.json({
      success: true,
      message: 'Service statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;
