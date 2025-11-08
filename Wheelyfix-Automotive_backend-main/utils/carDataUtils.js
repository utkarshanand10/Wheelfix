/**
 * Car Data Utility Functions
 * Provides functions to fetch car brands, models, and fuel types dynamically
 */

const fs = require('fs');
const path = require('path');

// Load car data from JSON file
const loadCarData = () => {
  try {
    const carDataPath = path.join(__dirname, '..', 'carData.json');
    const carData = JSON.parse(fs.readFileSync(carDataPath, 'utf8'));
    return carData;
  } catch (error) {
    console.error('Error loading car data:', error);
    return {};
  }
};

/**
 * Get all available car brands
 * @returns {string[]} Array of brand names
 */
const getAllBrands = () => {
  const carData = loadCarData();
  return Object.keys(carData);
};

/**
 * Get all models for a specific brand
 * @param {string} brand - The car brand name
 * @returns {string[]} Array of model names for the brand
 */
const getModelsByBrand = (brand) => {
  const carData = loadCarData();
  
  if (!brand || !carData[brand]) {
    return [];
  }
  
  return Object.keys(carData[brand]);
};

/**
 * Get all fuel types for a specific brand and model
 * @param {string} brand - The car brand name
 * @param {string} model - The car model name
 * @returns {string[]} Array of fuel types for the brand-model combination
 */
const getFuelTypesByBrandModel = (brand, model) => {
  const carData = loadCarData();
  
  if (!brand || !model || !carData[brand] || !carData[brand][model]) {
    return [];
  }
  
  return carData[brand][model];
};

/**
 * Check if a brand exists in the dataset
 * @param {string} brand - The car brand name
 * @returns {boolean} True if brand exists, false otherwise
 */
const brandExists = (brand) => {
  const carData = loadCarData();
  return carData.hasOwnProperty(brand);
};

/**
 * Check if a model exists for a specific brand
 * @param {string} brand - The car brand name
 * @param {string} model - The car model name
 * @returns {boolean} True if model exists for the brand, false otherwise
 */
const modelExists = (brand, model) => {
  const carData = loadCarData();
  return carData[brand] && carData[brand].hasOwnProperty(model);
};

/**
 * Check if a fuel type is available for a specific brand-model combination
 * @param {string} brand - The car brand name
 * @param {string} model - The car model name
 * @param {string} fuelType - The fuel type
 * @returns {boolean} True if fuel type is available, false otherwise
 */
const fuelTypeExists = (brand, model, fuelType) => {
  const carData = loadCarData();
  return carData[brand] && 
         carData[brand][model] && 
         carData[brand][model].includes(fuelType);
};

/**
 * Get complete vehicle information
 * @param {string} brand - The car brand name
 * @param {string} model - The car model name
 * @returns {object} Complete vehicle information including fuel types
 */
const getVehicleInfo = (brand, model) => {
  const carData = loadCarData();
  
  if (!brand || !model || !carData[brand] || !carData[brand][model]) {
    return null;
  }
  
  return {
    brand,
    model,
    fuelTypes: carData[brand][model],
    fullName: `${brand} ${model}`
  };
};

/**
 * Search for brands containing a specific string (case-insensitive)
 * @param {string} searchTerm - The search term
 * @returns {string[]} Array of matching brand names
 */
const searchBrands = (searchTerm) => {
  const brands = getAllBrands();
  
  if (!searchTerm) {
    return brands;
  }
  
  const searchLower = searchTerm.toLowerCase();
  return brands.filter(brand => 
    brand.toLowerCase().includes(searchLower)
  );
};

/**
 * Search for models within a brand containing a specific string (case-insensitive)
 * @param {string} brand - The car brand name
 * @param {string} searchTerm - The search term
 * @returns {string[]} Array of matching model names
 */
const searchModels = (brand, searchTerm) => {
  const models = getModelsByBrand(brand);
  
  if (!searchTerm) {
    return models;
  }
  
  const searchLower = searchTerm.toLowerCase();
  return models.filter(model => 
    model.toLowerCase().includes(searchLower)
  );
};

/**
 * Get statistics about the car dataset
 * @returns {object} Statistics about brands, models, and fuel types
 */
const getDatasetStats = () => {
  const carData = loadCarData();
  const brands = Object.keys(carData);
  let totalModels = 0;
  let totalFuelTypes = 0;
  const fuelTypeCounts = {};
  
  brands.forEach(brand => {
    const models = Object.keys(carData[brand]);
    totalModels += models.length;
    
    models.forEach(model => {
      const fuelTypes = carData[brand][model];
      totalFuelTypes += fuelTypes.length;
      
      fuelTypes.forEach(fuelType => {
        fuelTypeCounts[fuelType] = (fuelTypeCounts[fuelType] || 0) + 1;
      });
    });
  });
  
  return {
    totalBrands: brands.length,
    totalModels,
    totalFuelTypes,
    fuelTypeDistribution: fuelTypeCounts,
    brands
  };
};

/**
 * Get all unique fuel types available in the dataset
 * @returns {string[]} Array of unique fuel types
 */
const getAllFuelTypes = () => {
  const carData = loadCarData();
  const fuelTypes = new Set();
  
  Object.values(carData).forEach(brand => {
    Object.values(brand).forEach(modelFuelTypes => {
      modelFuelTypes.forEach(fuelType => {
        fuelTypes.add(fuelType);
      });
    });
  });
  
  return Array.from(fuelTypes).sort();
};

module.exports = {
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
  getAllFuelTypes,
  loadCarData
};
