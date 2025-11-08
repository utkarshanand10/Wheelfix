const express = require('express');
const router = express.Router();
const {
  getAllBrands,
  getModelsByBrand,
  getFuelTypesByBrandModel,
  brandExists,
  modelExists,
  fuelTypeExists,
  getVehicleInfo,
  searchBrands,
  searchModels,
  getDatasetStats,
  getAllFuelTypes
} = require('../utils/carDataUtils');

/**
 * GET /api/car-data/brands
 * Get all available car brands
 */
router.get('/brands', async (req, res) => {
  try {
    const brands = getAllBrands();
    
    res.json({
      success: true,
      brands: brands,
      count: brands.length
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car brands',
      error: error.message
    });
  }
});

/**
 * GET /api/car-data/models/:brand
 * Get all models for a specific brand
 */
router.get('/models/:brand', async (req, res) => {
  try {
    const { brand } = req.params;
    
    if (!brand) {
      return res.status(400).json({
        success: false,
        message: 'Brand parameter is required'
      });
    }
    
    const models = getModelsByBrand(brand);
    
    if (models.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No models found for brand: ${brand}`
      });
    }
    
    res.json({
      success: true,
      brand: brand,
      models: models,
      count: models.length
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car models',
      error: error.message
    });
  }
});

/**
 * GET /api/car-data/fuel-types/:brand/:model
 * Get all fuel types for a specific brand and model
 */
router.get('/fuel-types/:brand/:model', async (req, res) => {
  try {
    const { brand, model } = req.params;
    
    if (!brand || !model) {
      return res.status(400).json({
        success: false,
        message: 'Both brand and model parameters are required'
      });
    }
    
    const fuelTypes = getFuelTypesByBrandModel(brand, model);
    
    if (fuelTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No fuel types found for ${brand} ${model}`
      });
    }
    
    res.json({
      success: true,
      brand: brand,
      model: model,
      fuelTypes: fuelTypes,
      count: fuelTypes.length
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
 * GET /api/car-data/vehicle-info/:brand/:model
 * Get complete vehicle information
 */
router.get('/vehicle-info/:brand/:model', async (req, res) => {
  try {
    const { brand, model } = req.params;
    
    if (!brand || !model) {
      return res.status(400).json({
        success: false,
        message: 'Both brand and model parameters are required'
      });
    }
    
    const vehicleInfo = getVehicleInfo(brand, model);
    
    if (!vehicleInfo) {
      return res.status(404).json({
        success: false,
        message: `Vehicle not found: ${brand} ${model}`
      });
    }
    
    res.json({
      success: true,
      vehicle: vehicleInfo
    });
  } catch (error) {
    console.error('Error fetching vehicle info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle information',
      error: error.message
    });
  }
});

/**
 * GET /api/car-data/search/brands
 * Search for brands containing a specific string
 */
router.get('/search/brands', async (req, res) => {
  try {
    const { q } = req.query;
    
    const brands = searchBrands(q);
    
    res.json({
      success: true,
      query: q || '',
      brands: brands,
      count: brands.length
    });
  } catch (error) {
    console.error('Error searching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search brands',
      error: error.message
    });
  }
});

/**
 * GET /api/car-data/search/models
 * Search for models within a brand containing a specific string
 */
router.get('/search/models', async (req, res) => {
  try {
    const { brand, q } = req.query;
    
    if (!brand) {
      return res.status(400).json({
        success: false,
        message: 'Brand query parameter is required'
      });
    }
    
    const models = searchModels(brand, q);
    
    res.json({
      success: true,
      brand: brand,
      query: q || '',
      models: models,
      count: models.length
    });
  } catch (error) {
    console.error('Error searching models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search models',
      error: error.message
    });
  }
});

/**
 * GET /api/car-data/fuel-types
 * Get all unique fuel types available in the dataset
 */
router.get('/fuel-types', async (req, res) => {
  try {
    const fuelTypes = getAllFuelTypes();
    
    res.json({
      success: true,
      fuelTypes: fuelTypes,
      count: fuelTypes.length
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
 * GET /api/car-data/stats
 * Get statistics about the car dataset
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = getDatasetStats();
    
    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching dataset stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dataset statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/car-data/validate
 * Validate if a brand, model, and fuel type combination exists
 */
router.get('/validate', async (req, res) => {
  try {
    const { brand, model, fuelType } = req.query;
    
    if (!brand || !model || !fuelType) {
      return res.status(400).json({
        success: false,
        message: 'Brand, model, and fuelType query parameters are required'
      });
    }
    
    const exists = fuelTypeExists(brand, model, fuelType);
    
    res.json({
      success: true,
      brand: brand,
      model: model,
      fuelType: fuelType,
      exists: exists,
      message: exists ? 'Vehicle configuration is valid' : 'Vehicle configuration not found'
    });
  } catch (error) {
    console.error('Error validating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate vehicle configuration',
      error: error.message
    });
  }
});

module.exports = router;
