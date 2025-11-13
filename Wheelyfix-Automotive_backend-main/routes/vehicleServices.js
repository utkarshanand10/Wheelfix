const express = require("express");
const router = express.Router();
const PricingRule = require("../models/pricingModel");
const Service = require("../models/serviceModel");
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

    // --- Merge admin Service records (if any) so admin edits reflect on vehicle-services ---
    // We also want to include services that only exist as vehicle-specific overrides
    // (i.e., admin created an override for a service not present in the JSON) so that
    // creating a vehicle-specific override will make the service visible to clients.
    let overrides = [];
    try {
      const keyPrefix = `${brand}|${model}|${fuel}|`;
      overrides = await PricingRule.find({
        scope: "vehicleService",
        refId: { $regex: `^${keyPrefix}` },
      }).lean();
    } catch (e) {
      console.warn("Failed to fetch overrides early:", e?.message || e);
      overrides = [];
    }

    try {
      // Collect service names from JSON
      const svcNamesFromJson = Array.from(
        new Set(
          (services || [])
            .map((s) => (s.serviceName || s.title || "").toString().trim())
            .filter(Boolean)
        )
      );

      // Collect service names from overrides (last segment of refId)
      const svcNamesFromOverrides = Array.from(
        new Set(
          (overrides || [])
            .map((o) => {
              const parts = (o.refId || "").split("|");
              return parts[parts.length - 1] || "";
            })
            .filter(Boolean)
        )
      );

      const unionNames = Array.from(
        new Set([...svcNamesFromJson, ...svcNamesFromOverrides])
      );

      if (unionNames.length > 0) {
        // Build case-insensitive regex queries for titles and legacy name
        const orQueries = [];
        unionNames.forEach((n) => {
          const esc = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          orQueries.push({ title: new RegExp(`^${esc}$`, "i") });
          orQueries.push({ name: new RegExp(`^${esc}$`, "i") });
        });

        const svcDocs = await Service.find({ $or: orQueries }).lean();
        const map = new Map(
          svcDocs.map((d) => [
            ((d.title || d.name || "") + "").toString().toLowerCase(),
            d,
          ])
        );

        // Map existing services (from JSON) and enrich where possible
        services = (services || []).map((s) => {
          const key = (s.serviceName || s.title || "").toString().toLowerCase();
          const doc = map.get(key);
          if (!doc) return s;

          const priceInRupees =
            typeof doc.price === "number" ? doc.price / 100 : undefined;

          return {
            ...s,
            price: priceInRupees !== undefined ? priceInRupees : s.price,
            description: doc.description || s.description,
            estimatedTime:
              doc.durationMinutes ||
              s.estimatedTime ||
              s.duration ||
              s.durationMinutes,
            duration:
              doc.durationMinutes ||
              doc.duration ||
              s.duration ||
              s.durationMinutes,
            category: doc.category || s.category,
            featured:
              typeof doc.featured === "boolean" ? doc.featured : s.featured,
            status: doc.status || s.status,
            primaryImage: doc.primaryImage || s.primaryImage,
          };
        });

        // For override-only service names (not present in JSON), append synthetic entries using admin Service docs or override metadata
        const existingNames = new Set(
          (services || []).map((s) =>
            (s.serviceName || s.title || "").toString().toLowerCase()
          )
        );
        const overridesMap = new Map(
          (overrides || []).map((o) => [
            (o.refId || "").split("|").slice(-1)[0],
            o,
          ])
        );

        for (const name of svcNamesFromOverrides) {
          if (existingNames.has(name.toString().toLowerCase())) continue; // already present
          const doc = map.get(name.toString().toLowerCase());
          const o = overridesMap.get(name);
          // Build a synthetic service object
          const fromDoc = doc || {};
          const meta = (o && o.metadata) || {};
          const priceFromDoc =
            typeof fromDoc.price === "number" ? fromDoc.price / 100 : undefined;
          const overridePriceInRupees =
            o && typeof o.price === "number" ? o.price / 100 : priceFromDoc;

          const synthetic = {
            _id: `svc_override_${brand}_${model}_${fuel}_${name}`,
            title: fromDoc.title || name,
            serviceName: name,
            description: meta.description || fromDoc.description || "",
            price:
              overridePriceInRupees !== undefined
                ? overridePriceInRupees
                : fromDoc.price !== undefined
                ? fromDoc.price / 100
                : 0,
            originalPrice:
              fromDoc.price !== undefined ? fromDoc.price / 100 : null,
            duration: meta.durationMinutes || fromDoc.durationMinutes || 60,
            category: meta.category || fromDoc.category || "General Service",
            status: meta.status || fromDoc.status || "active",
            featured: !!meta.featured || !!fromDoc.featured,
            primaryImage: fromDoc.primaryImage || null,
          };

          services.push(synthetic);
        }
      }
    } catch (e) {
      console.warn(
        "Failed to merge admin Service records into vehicle services:",
        e?.message || e
      );
    }

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
            if (!o) {
              // No override: price from JSON is in rupees, return as-is (may have been merged with admin Service above)
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
                : s.price; // Fallback to JSON or admin Service price (already in rupees)

            return {
              ...s,
              // Active price (after applying override) in RUPEES
              price: overridePriceInRupees,
              // Keep the original price from JSON/admin service for reference (in RUPEES)
              originalPrice: s.price,
              // If metadata contains a discountedPrice (stored in paise), expose it in rupees
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
