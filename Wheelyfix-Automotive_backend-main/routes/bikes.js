/**
 * Bikes API Routes
 * Provides endpoints for bike brands, models, and fuel types
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load bike data from JSON file
const loadBikeData = () => {
  try {
    const bikeDataPath = path.join(__dirname, '../bikeData.json');
    const bikeData = JSON.parse(fs.readFileSync(bikeDataPath, 'utf8'));
    return bikeData;
  } catch (error) {
    console.error('Error loading bike data:', error);
    throw new Error('Failed to load bike data');
  }
};

/**
 * GET /api/bikes/brands
 * Returns all available bike brands
 */
router.get('/brands', (req, res) => {
  try {
    const bikeData = loadBikeData();
    const brands = Object.keys(bikeData);
    
    res.json({
      success: true,
      message: 'Bike brands retrieved successfully',
      data: {
        brands: brands,
        count: brands.length
      }
    });
  } catch (error) {
    console.error('Error fetching bike brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bike brands',
      error: error.message
    });
  }
});

/**
 * GET /api/bikes/models/:brand
 * Returns all models for a specific bike brand
 */
router.get('/models/:brand', (req, res) => {
  try {
    const { brand } = req.params;
    const bikeData = loadBikeData();
    
    if (!bikeData[brand]) {
      return res.status(404).json({
        success: false,
        message: `Brand '${brand}' not found`
      });
    }
    
    const models = Object.keys(bikeData[brand]);
    
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
    console.error('Error fetching bike models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bike models',
      error: error.message
    });
  }
});

/**
 * GET /api/bikes/fuel-types/:brand/:model
 * Returns all fuel types for a specific bike brand and model
 */
router.get('/fuel-types/:brand/:model', (req, res) => {
  try {
    const { brand, model } = req.params;
    const bikeData = loadBikeData();
    
    if (!bikeData[brand]) {
      return res.status(404).json({
        success: false,
        message: `Brand '${brand}' not found`
      });
    }
    
    if (!bikeData[brand][model]) {
      return res.status(404).json({
        success: false,
        message: `Model '${model}' not found for brand '${brand}'`
      });
    }
    
    const fuelTypes = bikeData[brand][model];
    
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
    console.error('Error fetching bike fuel types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bike fuel types',
      error: error.message
    });
  }
});

module.exports = router;
