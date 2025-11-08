const express = require("express");
const router = express.Router();
const PricingRule = require("../models/pricingModel");
const { verifyToken } = require("../middleware/adminAuth");
const fs = require("fs");
const path = require("path");

/**
 * POST /api/vehicle-services
 * Get available services for a specific vehicle combination
 * Body: { brand: string, model: string, fuel: string }
 */
router.post("/", async (req, res) => {
  try {
    const { brand, model, fuel } = req.body;

    // Validate required fields
    if (!brand || !model || !fuel) {
      return res.status(400).json({
        success: false,
        message: "Brand, model, and fuel type are required fields",
      });
    }

    // Read services data from JSON file
    const servicesFilePath = path.join(__dirname, "..", "services.json");

    if (!fs.existsSync(servicesFilePath)) {
      return res.status(500).json({
        success: false,
        message: "Services data not available",
      });
    }

    const servicesData = JSON.parse(fs.readFileSync(servicesFilePath, "utf8"));

    // Check if brand exists
    if (!servicesData[brand]) {
      return res.json({
        success: true,
        message: "No services available for this selection",
        services: [],
      });
    }

    // Check if model exists for the brand
    if (!servicesData[brand][model]) {
      return res.json({
        success: true,
        message: "No services available for this selection",
        services: [],
      });
    }

    // Check if fuel type exists for the model
    if (!servicesData[brand][model][fuel]) {
      return res.json({
        success: true,
        message: "No services available for this selection",
        services: [],
      });
    }

    // Return the services for the specific combination
    let services = servicesData[brand][model][fuel];

    // Apply any overrides stored as PricingRule with scope 'vehicleService'
    // We support price override plus metadata overrides (featured, description, durationMinutes, category, deleted)
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
            if (!o) return s;
            const meta = o.metadata || {};
            // Skip deleted overrides entirely
            if (meta.deleted) return null;
            return {
              ...s,
              price: typeof o.price === "number" ? o.price : s.price,
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
            };
          })
          .filter(Boolean);
      }
    } catch (e) {
      console.warn("Failed to apply vehicle overrides:", e?.message || e);
    }

    res.json({
      success: true,
      services: services,
      vehicleInfo: {
        brand,
        model,
        fuel,
      },
    });
  } catch (error) {
    console.error("Error fetching vehicle services:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching services",
    });
  }
});

/**
 * GET /api/vehicle-services/brands
 * Get all available brands
 */
router.get("/brands", async (req, res) => {
  try {
    const servicesFilePath = path.join(__dirname, "..", "services.json");

    if (!fs.existsSync(servicesFilePath)) {
      return res.status(500).json({
        success: false,
        message: "Services data not available",
      });
    }

    const servicesData = JSON.parse(fs.readFileSync(servicesFilePath, "utf8"));
    const brands = Object.keys(servicesData);

    res.json({
      success: true,
      brands: brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching brands",
    });
  }
});

/**
 * GET /api/vehicle-services/models/:brand
 * Get all available models for a specific brand
 */
router.get("/models/:brand", async (req, res) => {
  try {
    const { brand } = req.params;

    const servicesFilePath = path.join(__dirname, "..", "services.json");

    if (!fs.existsSync(servicesFilePath)) {
      return res.status(500).json({
        success: false,
        message: "Services data not available",
      });
    }

    const servicesData = JSON.parse(fs.readFileSync(servicesFilePath, "utf8"));

    if (!servicesData[brand]) {
      return res.json({
        success: true,
        models: [],
      });
    }

    const models = Object.keys(servicesData[brand]);

    res.json({
      success: true,
      models: models,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching models",
    });
  }
});

/**
 * GET /api/vehicle-services/fuel-types/:brand/:model
 * Get all available fuel types for a specific brand and model
 */
router.get("/fuel-types/:brand/:model", async (req, res) => {
  try {
    const { brand, model } = req.params;

    const servicesFilePath = path.join(__dirname, "..", "services.json");

    if (!fs.existsSync(servicesFilePath)) {
      return res.status(500).json({
        success: false,
        message: "Services data not available",
      });
    }

    const servicesData = JSON.parse(fs.readFileSync(servicesFilePath, "utf8"));

    if (!servicesData[brand] || !servicesData[brand][model]) {
      return res.json({
        success: true,
        fuelTypes: [],
      });
    }

    const fuelTypes = Object.keys(servicesData[brand][model]);

    res.json({
      success: true,
      fuelTypes: fuelTypes,
    });
  } catch (error) {
    console.error("Error fetching fuel types:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching fuel types",
    });
  }
});

// Export router after all route registrations

/**
 * Admin: Upsert vehicle-specific price override
 * PUT /api/vehicle-services/override/price
 * Body: { brand, model, fuel, serviceName, price }
 * Requires admin token
 */
router.put("/override/price", verifyToken, async (req, res) => {
  try {
    const { brand, model, fuel, serviceName } = req.body;
    let { price } = req.body;

    // Additional optional metadata overrides
    const {
      featured,
      description,
      durationMinutes,
      category,
      deleted,
      status,
    } = req.body;

    if (!brand || !model || !fuel || !serviceName) {
      return res.status(400).json({
        success: false,
        message: "brand, model, fuel & serviceName are required",
      });
    }

    if (price !== undefined && typeof price !== "number") {
      return res.status(400).json({
        success: false,
        message: "price must be a number when provided",
      });
    }

    const refId = `${brand}|${model}|${fuel}|${serviceName}`;
    // Load existing to merge metadata
    const existing = await PricingRule.findOne({
      scope: "vehicleService",
      refId,
    });

    const mergedMeta = {
      ...(existing?.metadata || {}),
      ...(featured !== undefined ? { featured: !!featured } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(durationMinutes !== undefined ? { durationMinutes } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(deleted !== undefined ? { deleted: !!deleted } : {}),
      ...(status !== undefined ? { status } : {}),
      updatedBy: req.user?._id,
      updatedAt: new Date().toISOString(),
    };

    // If price omitted, keep existing price (or require price if no existing rule)
    if (price === undefined && existing) price = existing.price;
    if (price === undefined) price = 0; // baseline default

    const doc = await PricingRule.findOneAndUpdate(
      { scope: "vehicleService", refId },
      {
        scope: "vehicleService",
        refId,
        price,
        metadata: mergedMeta,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: "Override updated",
      data: {
        refId,
        price: doc.price,
        metadata: doc.metadata,
      },
    });
  } catch (error) {
    console.error("Override update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update override",
    });
  }
});

module.exports = router;
