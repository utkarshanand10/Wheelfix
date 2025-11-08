/**
 * Cars API Routes
 * Provides endpoints for car brands, models, and fuel types
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load car data from JSON file
const loadCarData = () => {
  try {
    const carDataPath = path.join(__dirname, '../carData.json');
    const carData = JSON.parse(fs.readFileSync(carDataPath, 'utf8'));
    return carData;
  } catch (error) {
    console.error('Error loading car data:', error);
    throw new Error('Failed to load car data');
  }
};

/**
 * GET /api/cars/brands
 * Returns all available car brands
 */
router.get('/brands', (req, res) => {
  try {
    const carData = loadCarData();
    const brands = Object.keys(carData);
    
    res.json({
      success: true,
      message: 'Brands retrieved successfully',
      data: {
        brands: brands,
        count: brands.length
      }
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: error.message
    });
  }
});

/**
 * GET /api/cars/models/:brand
 * Returns all models for a specific brand
 */
router.get('/models/:brand', (req, res) => {
  try {
    const { brand } = req.params;
    const carData = loadCarData();
    
    // Check if brand exists
    if (!carData[brand]) {
      return res.status(404).json({
        success: false,
        message: `Brand '${brand}' not found`,
        data: {
          brand: brand,
          models: []
        }
      });
    }
    
    const models = Object.keys(carData[brand]);
    
    res.json({
      success: true,
      message: `Models for ${brand} retrieved successfully`,
      data: {
        brand: brand,
        models: models,
        count: models.length
      }
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch models',
      error: error.message
    });
  }
});

/**
 * GET /api/cars/fuel-types/:brand/:model
 * Returns all fuel types for a specific brand and model
 */
router.get('/fuel-types/:brand/:model', (req, res) => {
  try {
    const { brand, model } = req.params;
    const carData = loadCarData();
    
    // Check if brand exists
    if (!carData[brand]) {
      return res.status(404).json({
        success: false,
        message: `Brand '${brand}' not found`,
        data: {
          brand: brand,
          model: model,
          fuelTypes: []
        }
      });
    }
    
    // Check if model exists for the brand
    if (!carData[brand][model]) {
      return res.status(404).json({
        success: false,
        message: `Model '${model}' not found for brand '${brand}'`,
        data: {
          brand: brand,
          model: model,
          fuelTypes: []
        }
      });
    }
    
    const fuelTypes = carData[brand][model];
    
    res.json({
      success: true,
      message: `Fuel types for ${brand} ${model} retrieved successfully`,
      data: {
        brand: brand,
        model: model,
        fuelTypes: fuelTypes,
        count: fuelTypes.length
      }
    });
  } catch (error) {
    console.error('Error fetching fuel types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fuel types',
      error: error.message
    });
  }
});

/**
 * GET /api/cars/search
 * Search for cars by brand, model, or fuel type
 * Query parameters: brand, model, fuelType
 */
router.get('/search', (req, res) => {
  try {
    const { brand, model, fuelType } = req.query;
    const carData = loadCarData();
    let results = [];
    
    // If no search parameters provided, return all cars
    if (!brand && !model && !fuelType) {
      // Flatten the car data structure
      Object.keys(carData).forEach(brandName => {
        Object.keys(carData[brandName]).forEach(modelName => {
          carData[brandName][modelName].forEach(fuel => {
            results.push({
              brand: brandName,
              model: modelName,
              fuelType: fuel
            });
          });
        });
      });
      
      return res.json({
        success: true,
        message: 'All cars retrieved successfully',
        data: {
          cars: results,
          count: results.length
        }
      });
    }
    
    // Search by brand
    if (brand && !model && !fuelType) {
      if (carData[brand]) {
        Object.keys(carData[brand]).forEach(modelName => {
          carData[brand][modelName].forEach(fuel => {
            results.push({
              brand: brand,
              model: modelName,
              fuelType: fuel
            });
          });
        });
      }
    }
    // Search by brand and model
    else if (brand && model && !fuelType) {
      if (carData[brand] && carData[brand][model]) {
        carData[brand][model].forEach(fuel => {
          results.push({
            brand: brand,
            model: model,
            fuelType: fuel
          });
        });
      }
    }
    // Search by fuel type
    else if (!brand && !model && fuelType) {
      Object.keys(carData).forEach(brandName => {
        Object.keys(carData[brandName]).forEach(modelName => {
          if (carData[brandName][modelName].includes(fuelType)) {
            results.push({
              brand: brandName,
              model: modelName,
              fuelType: fuelType
            });
          }
        });
      });
    }
    // Search by all parameters
    else if (brand && model && fuelType) {
      if (carData[brand] && carData[brand][model] && carData[brand][model].includes(fuelType)) {
        results.push({
          brand: brand,
          model: model,
          fuelType: fuelType
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Search results retrieved successfully',
      data: {
        cars: results,
        count: results.length,
        searchParams: {
          brand: brand || null,
          model: model || null,
          fuelType: fuelType || null
        }
      }
    });
  } catch (error) {
    console.error('Error searching cars:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search cars',
      error: error.message
    });
  }
});

/**
 * GET /api/cars
 * Returns complete car data structure
 */
router.get('/', (req, res) => {
  try {
    const carData = loadCarData();
    
    // Calculate statistics
    const brands = Object.keys(carData);
    let totalModels = 0;
    let totalCombinations = 0;
    
    brands.forEach(brand => {
      const models = Object.keys(carData[brand]);
      totalModels += models.length;
      
      models.forEach(model => {
        totalCombinations += carData[brand][model].length;
      });
    });
    
    res.json({
      success: true,
      message: 'Car data retrieved successfully',
      data: {
        carData: carData,
        statistics: {
          totalBrands: brands.length,
          totalModels: totalModels,
          totalCombinations: totalCombinations
        }
      }
    });
  } catch (error) {
    console.error('Error fetching car data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car data',
      error: error.message
    });
  }
});

module.exports = router;
