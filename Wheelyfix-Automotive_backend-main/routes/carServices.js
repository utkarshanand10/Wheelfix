/**
 * Car Services API Routes
 * Provides endpoints for fetching services based on vehicle brand and model
 */

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const PricingRule = require("../models/pricingModel");

// Load services data from JSON file
const loadServicesData = () => {
  try {
    const servicesDataPath = path.join(__dirname, "../services.json");
    const servicesData = JSON.parse(fs.readFileSync(servicesDataPath, "utf8"));
    return servicesData;
  } catch (error) {
    console.error("Error loading services data:", error);
    throw new Error("Failed to load services data");
  }
};

/**
 * GET /api/getCarServices
 * Returns services for a specific brand, model, and fuel combination
 * Query parameters: brand, model, fuel
 */
router.get("/", async (req, res) => {
  try {
    const { brand, model, fuel } = req.query;

    console.log(
      `🔍 Car Services API called: brand=${brand}, model=${model}, fuel=${fuel}`
    );

    // Validate required fields
    if (!brand || !model || !fuel) {
      console.log("❌ Car Services API: Missing required parameters");
      return res.status(400).json({
        success: false,
        message: "Brand, model, and fuel parameters are required.",
        required: ["brand", "model", "fuel"],
      });
    }

    // Ensure this is only for car services - add explicit validation
    console.log(
      `🚗 Car Services API: Fetching CAR services only for ${brand} ${model} (${fuel})`
    );

    // Load services data
    const servicesData = loadServicesData();

    // Check if services exist for the specified combination
    if (
      !servicesData[brand] ||
      !servicesData[brand][model] ||
      !servicesData[brand][model][fuel]
    ) {
      console.log(
        `❌ Car Services API: No services found for ${brand} ${model} ${fuel}`
      );
      return res.status(404).json({
        success: false,
        message: `No services found for ${brand} ${model} (${fuel})`,
        data: {
          brand: brand,
          model: model,
          fuel: fuel,
          services: [],
        },
      });
    }

    let services = servicesData[brand][model][fuel];
    console.log(
      `✅ Car Services API: Found ${services.length} services for ${brand} ${model} (${fuel})`
    );

    // Apply pricing overrides from PricingRule (same as vehicle-services endpoint)
    // This ensures admin price updates are reflected on client panel
    try {
      const keyPrefix = `${brand}|${model}|${fuel}|`;
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
            if (!o) {
              // No override: price from JSON is in rupees, return as-is
              return s;
            }
            const meta = o.metadata || {};
            // Skip deleted overrides entirely
            if (meta.deleted) return null;

            // CRITICAL: Normalize price units
            // JSON prices (s.price) are in RUPEES (e.g., 2160)
            // Override prices (o.price) are in PAISE (e.g., 250000)
            // Convert override price to rupees for consistency
            const overridePriceInRupees =
              typeof o.price === "number"
                ? o.price / 100 // Convert paise to rupees
                : s.price; // Fallback to JSON price (already in rupees)

            return {
              ...s,
              // Active price (after override) in RUPEES
              price: overridePriceInRupees,
              // Original JSON price for reference (in RUPEES)
              originalPrice: s.price,
              // If override metadata contains a discountedPrice (paise), expose it in RUPEES
              discountedPrice:
                typeof meta.discountedPrice === "number"
                  ? meta.discountedPrice / 100
                  : undefined,
              featured: !!meta.featured,
              description: meta.description || s.description,
              estimatedTime:
                meta.durationMinutes ||
                s.estimatedTime ||
                s.duration ||
                s.durationMinutes,
              duration: meta.durationMinutes || s.duration || s.durationMinutes,
              category: meta.category || s.category || s.type,
              status: meta.status || s.status || "active",
              metadata: meta,
            };
          })
          .filter(Boolean);
        console.log(
          `✅ Applied ${overrides.length} price overrides for ${brand} ${model} ${fuel}`
        );
      }
    } catch (e) {
      console.warn(
        "Failed to apply vehicle overrides in getCarServices:",
        e?.message || e
      );
    }

    // Transform services to match the required format
    // Prices are now normalized to rupees (both JSON and overrides)
    const transformedServices = services.map((service) => ({
      name: service.serviceName,
      // Price is in rupees (includes overrides if any)
      price: service.price, // Keep as number for client-side formatting
      priceFormatted: `₹${service.price.toLocaleString("en-IN")}`, // Formatted string
      desc: service.description,
      image: `/images/car-${service.category
        .toLowerCase()
        .replace(/\s+/g, "-")}.png`,
      category: service.category,
      estimatedTime: service.estimatedTime,
      // originalPrice is the JSON price (before overrides) - already set in override logic
      originalPrice: service.originalPrice || service.price, // Original JSON price or current if no override
    }));

    res.json({
      success: true,
      message: `Car services for ${brand} ${model} (${fuel}) retrieved successfully`,
      data: {
        brand: brand,
        model: model,
        fuel: fuel,
        services: transformedServices,
      },
    });
  } catch (error) {
    console.error("Error fetching car services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch car services",
      error: error.message,
    });
  }
});

/**
 * GET /api/getCarServices/brands
 * Returns all available brands
 */
router.get("/brands", (req, res) => {
  try {
    const servicesData = loadServicesData();
    const brands = Object.keys(servicesData).sort();

    res.json({
      success: true,
      message: "Brands retrieved successfully",
      data: {
        brands: brands,
        count: brands.length,
      },
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
      error: error.message,
    });
  }
});

/**
 * GET /api/getCarServices/models/:brand
 * Returns all models for a specific brand
 */
router.get("/models/:brand", (req, res) => {
  try {
    const { brand } = req.params;
    const servicesData = loadServicesData();

    if (!servicesData[brand]) {
      return res.status(404).json({
        success: false,
        message: `No models found for brand: ${brand}`,
        data: {
          brand: brand,
          models: [],
        },
      });
    }

    const models = Object.keys(servicesData[brand]).sort();

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
    console.error("Error fetching models:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch models",
      error: error.message,
    });
  }
});

module.exports = router;
