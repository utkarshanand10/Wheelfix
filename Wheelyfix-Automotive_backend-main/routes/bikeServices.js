/**
 * Bike Services API Routes
 * Provides endpoints for fetching services based on bike brand and model
 */

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const PricingRule = require("../models/pricingModel");

// Load bike services data from JSON file
const loadBikeServicesData = () => {
  try {
    const bikeServicesDataPath = path.join(__dirname, "../bikeServices.json");
    const bikeServicesData = JSON.parse(
      fs.readFileSync(bikeServicesDataPath, "utf8")
    );
    return bikeServicesData;
  } catch (error) {
    console.error("Error loading bike services data:", error);
    throw new Error("Failed to load bike services data");
  }
};

/**
 * GET /api/getBikeServices
 * Returns services for a specific bike brand and model combination
 * Query parameters: brand, model
 */
router.get("/", async (req, res) => {
  try {
    const { brand, model } = req.query;

    console.log(`🔍 Bike Services API called: brand=${brand}, model=${model}`);

    // Validate required fields
    if (!brand || !model) {
      console.log("❌ Bike Services API: Missing required parameters");
      return res.status(400).json({
        success: false,
        message: "Brand and model parameters are required.",
        required: ["brand", "model"],
      });
    }

    // Ensure this is only for bike services - add explicit validation
    console.log(
      `🏍️ Bike Services API: Fetching BIKE services only for ${brand} ${model}`
    );

    // Load bike services data
    const bikeServicesData = loadBikeServicesData();

    // Check if services exist for the specified combination
    if (!bikeServicesData[brand] || !bikeServicesData[brand][model]) {
      console.log(
        `❌ Bike Services API: No services found for ${brand} ${model}`
      );
      return res.status(404).json({
        success: false,
        message: `No services found for ${brand} ${model}`,
        data: {
          brand: brand,
          model: model,
          services: [],
        },
      });
    }

    // Get services from all fuel types for this model (bikes typically have only Petrol)
    let services = [];
    Object.values(bikeServicesData[brand][model]).forEach((fuelServices) => {
      services = services.concat(fuelServices);
    });

    console.log(
      `✅ Bike Services API: Found ${services.length} services for ${brand} ${model}`
    );

    // Apply any vehicle-specific overrides (PricingRule.scope = 'vehicleService')
    try {
      const keyPrefix = `${brand}|${model}|`;
      const overrides = await PricingRule.find({
        scope: "vehicleService",
        refId: { $regex: `^${keyPrefix}` },
      }).lean();

      if (overrides && overrides.length) {
        const map = new Map(
          overrides.map((o) => [o.refId.split("|").slice(-1)[0], o])
        );
        services = services
          .map((s) => {
            const o = map.get(s.serviceName);
            if (!o) return s;
            const meta = o.metadata || {};
            if (meta.deleted) return null;
            const overridePriceInRupees =
              typeof o.price === "number" ? o.price / 100 : s.price;
            return {
              ...s,
              price: overridePriceInRupees,
              originalPrice: s.price,
              discountedPrice:
                typeof meta.discountedPrice === "number"
                  ? meta.discountedPrice / 100
                  : undefined,
              description: meta.description || s.description,
              estimatedTime:
                meta.durationMinutes ||
                s.estimatedTime ||
                s.duration ||
                s.durationMinutes,
              duration: meta.durationMinutes || s.duration || s.durationMinutes,
              category: meta.category || s.category,
              featured: !!meta.featured,
              status: meta.status || s.status,
              metadata: meta,
            };
          })
          .filter(Boolean);
      }
    } catch (e) {
      console.warn("Failed to apply bike overrides:", e?.message || e);
    }

    // Transform services to match the required format (price as number in RUPEES)
    const transformedServices = services.map((service) => ({
      name: service.serviceName,
      price:
        typeof service.price === "number"
          ? service.price
          : Number(String(service.price).replace(/[^0-9.]/g, "")),
      desc: service.description,
      image: `/images/bike-${(service.category || "general")
        .toLowerCase()
        .replace(/\s+/g, "-")}.png`,
      category: service.category,
      estimatedTime: service.estimatedTime,
      originalPrice:
        typeof service.originalPrice === "number"
          ? service.originalPrice
          : service.price,
      discountedPrice:
        typeof service.discountedPrice === "number"
          ? service.discountedPrice
          : undefined,
      metadata: service.metadata || undefined,
    }));

    res.json({
      success: true,
      message: `Bike services for ${brand} ${model} retrieved successfully`,
      data: {
        brand: brand,
        model: model,
        services: transformedServices,
      },
    });
  } catch (error) {
    console.error("Error fetching bike services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bike services",
      error: error.message,
    });
  }
});

/**
 * GET /api/getBikeServices/brands
 * Returns all available bike brands
 */
router.get("/brands", (req, res) => {
  try {
    const bikeServicesData = loadBikeServicesData();
    const brands = Object.keys(bikeServicesData).sort();

    res.json({
      success: true,
      message: "Bike brands retrieved successfully",
      data: {
        brands: brands,
        count: brands.length,
      },
    });
  } catch (error) {
    console.error("Error fetching bike brands:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bike brands",
      error: error.message,
    });
  }
});

/**
 * GET /api/getBikeServices/models/:brand
 * Returns all models for a specific bike brand
 */
router.get("/models/:brand", (req, res) => {
  try {
    const { brand } = req.params;
    const bikeServicesData = loadBikeServicesData();

    if (!bikeServicesData[brand]) {
      return res.status(404).json({
        success: false,
        message: `No models found for brand: ${brand}`,
        data: {
          brand: brand,
          models: [],
        },
      });
    }

    const models = Object.keys(bikeServicesData[brand]).sort();

    res.json({
      success: true,
      message: `Models for ${brand} retrieved successfully`,
      data: {
        brand: brand,
        models: models,
        count: models.length,
      },
    });
  } catch (error) {
    console.error("Error fetching bike models:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bike models",
      error: error.message,
    });
  }
});

module.exports = router;
