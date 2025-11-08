const Brand = require("../models/brandModel");
const Product = require("../models/productModel");
const AuditLog = require("../models/auditLogModel");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

// Get all brands with pagination, search, and filters
const getBrands = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      featured,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filter.status = status;
    if (featured !== undefined) filter.featured = featured === "true";

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const brands = await Brand.find(filter)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Brand.countDocuments(filter);

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: "read",
      entity: "brand",
      entityId: "multiple",
      entityTitle: "Brands List",
      metadata: {
        filters: filter,
        pagination: { page, limit },
        total,
      },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: req.sessionID,
      severity: "low",
    });

    res.json({
      success: true,
      data: {
        brands,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get brands error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
};

// Get single brand by ID
const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Get products count for this brand
    const productsCount = await Product.countDocuments({ brand: id });

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: "read",
      entity: "brand",
      entityId: brand._id.toString(),
      entityTitle: brand.name,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: req.sessionID,
      severity: "low",
    });

    res.json({
      success: true,
      data: {
        brand: {
          ...brand.toObject(),
          productsCount,
        },
      },
    });
  } catch (error) {
    console.error("Get brand error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brand",
    });
  }
};

// Create new brand
const createBrand = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const brandData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const brand = new Brand(brandData);
    await brand.save();

    // Populate references
    await brand.populate("createdBy", "name email");

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: "create",
      entity: "brand",
      entityId: brand._id.toString(),
      entityTitle: brand.name,
      changes: {
        after: brand.toObject(),
        fields: Object.keys(brandData),
      },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: req.sessionID,
      severity: "medium",
    });

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: { brand },
    });
  } catch (error) {
    console.error("Create brand error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Brand with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create brand",
    });
  }
};

// Update brand
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const oldBrand = brand.toObject();
    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
    };

    const updatedBrand = await Brand.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: "update",
      entity: "brand",
      entityId: brand._id.toString(),
      entityTitle: brand.name,
      changes: {
        before: oldBrand,
        after: updatedBrand.toObject(),
        fields: Object.keys(updateData),
      },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: req.sessionID,
      severity: "medium",
    });

    res.json({
      success: true,
      message: "Brand updated successfully",
      data: { brand: updatedBrand },
    });
  } catch (error) {
    console.error("Update brand error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Brand with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update brand",
    });
  }
};

// Delete brand
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Check if brand has products
    const productsCount = await Product.countDocuments({ brand: id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete brand. It has ${productsCount} associated products. Please reassign or delete the products first.`,
      });
    }

    await Brand.findByIdAndDelete(id);

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: "delete",
      entity: "brand",
      entityId: brand._id.toString(),
      entityTitle: brand.name,
      changes: {
        before: brand.toObject(),
        fields: Object.keys(brand.toObject()),
      },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: req.sessionID,
      severity: "high",
    });

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Delete brand error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete brand",
    });
  }
};

// Toggle brand status
const toggleBrandStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const brand = await Brand.findByIdAndUpdate(
      id,
      { status, updatedBy: req.user._id },
      { new: true }
    ).populate("updatedBy", "name email");

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: "status_change",
      entity: "brand",
      entityId: brand._id.toString(),
      entityTitle: brand.name,
      changes: {
        before: { status: brand.status },
        after: { status },
        fields: ["status"],
      },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: req.sessionID,
      severity: "medium",
    });

    res.json({
      success: true,
      message: "Brand status updated successfully",
      data: { brand },
    });
  } catch (error) {
    console.error("Toggle brand status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update brand status",
    });
  }
};

// Get brand statistics
const getBrandStats = async (req, res) => {
  try {
    const stats = await Brand.aggregate([
      {
        $group: {
          _id: null,
          totalBrands: { $sum: 1 },
          activeBrands: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          inactiveBrands: {
            $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
          },
          pendingBrands: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          featuredBrands: {
            $sum: { $cond: ["$featured", 1, 0] },
          },
        },
      },
    ]);

    const brandsWithProducts = await Brand.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "brand",
          as: "products",
        },
      },
      {
        $project: {
          name: 1,
          status: 1,
          featured: 1,
          productsCount: { $size: "$products" },
          totalStock: {
            $sum: "$products.stock",
          },
          averagePrice: {
            $avg: "$products.price",
          },
        },
      },
      {
        $sort: { productsCount: -1 },
      },
    ]);

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: "read",
      entity: "brand",
      entityId: "stats",
      entityTitle: "Brand Statistics",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: req.sessionID,
      severity: "low",
    });

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        brandsWithProducts,
      },
    });
  } catch (error) {
    console.error("Get brand stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brand statistics",
    });
  }
};

// Get brand products
const getBrandProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      featured,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Check if brand exists
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Build filter object
    const filter = { brand: id };

    if (status) filter.status = status;
    if (featured !== undefined) filter.featured = featured === "true";

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const products = await Product.find(filter)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        brand: {
          _id: brand._id,
          name: brand.name,
          logo: brand.logo,
        },
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get brand products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brand products",
    });
  }
};

// Toggle brand visibility on home page
const toggleBrandVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { visibleOnHome } = req.body;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    brand.visibleOnHome = visibleOnHome;
    brand.updatedBy = req.user._id;
    await brand.save();

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: "update",
      entity: "brand",
      entityId: brand._id,
      entityTitle: brand.name,
      metadata: { visibleOnHome },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: req.sessionID,
      severity: "low",
    });

    res.json({
      success: true,
      message: `Brand ${visibleOnHome ? "shown" : "hidden"} on home page`,
      data: brand,
    });
  } catch (error) {
    console.error("Toggle brand visibility error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle brand visibility",
    });
  }
};

// Reorder brands
const reorderBrands = async (req, res) => {
  try {
    const { brandOrders } = req.body; // Array of { id, orderIndex }

    const updatePromises = brandOrders.map(({ id, orderIndex }) =>
      Brand.findByIdAndUpdate(id, { orderIndex }, { new: true })
    );

    await Promise.all(updatePromises);

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: "update",
      entity: "brand",
      entityId: "bulk",
      entityTitle: "Brand Reordering",
      metadata: { count: brandOrders.length },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: req.sessionID,
      severity: "low",
    });

    res.json({
      success: true,
      message: "Brands reordered successfully",
    });
  } catch (error) {
    console.error("Reorder brands error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder brands",
    });
  }
};

// Bulk update brands
const bulkUpdateBrands = async (req, res) => {
  try {
    const { brandIds, updateData } = req.body;

    if (!brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Brand IDs are required",
      });
    }

    const result = await Brand.updateMany(
      { _id: { $in: brandIds } },
      {
        ...updateData,
        updatedBy: req.user._id,
      }
    );

    // Log activity
    await AuditLog.logActivity({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: "bulk_update",
      entity: "brand",
      entityId: "bulk",
      entityTitle: "Bulk Brand Update",
      metadata: {
        count: brandIds.length,
        updateData,
      },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: req.sessionID,
      severity: "medium",
    });

    res.json({
      success: true,
      message: `${result.modifiedCount} brands updated successfully`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("Bulk update brands error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk update brands",
    });
  }
};
// Get all vehicle brands (cars + bikes) from JSON datasets
const getVehicleBrands = async (req, res) => {
  try {
    // Load car and bike datasets
    const carDataPath = path.join(__dirname, "..", "carData.json");
    const bikeDataPath = path.join(__dirname, "..", "bikeData.json");

    const safeLoad = (p) => {
      try {
        return JSON.parse(fs.readFileSync(p, "utf8"));
      } catch (e) {
        return {};
      }
    };

    const carData = safeLoad(carDataPath);
    const bikeData = safeLoad(bikeDataPath);

    const carBrands = Object.keys(carData || {});
    const bikeBrands = Object.keys(bikeData || {});

    // Build a unified list with minimal brand-like shape
    const now = new Date().toISOString();
    const toSlug = (name) =>
      name
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const mappedCars = carBrands.map((name) => ({
      _id: `vehicle:car:${name}`,
      name,
      slug: toSlug(name),
      description: undefined,
      logo: null,
      website: undefined,
      email: undefined,
      phone: undefined,
      status: "active",
      featured: false,
      visibleOnHome: false,
      orderIndex: 0,
      productsCount: 0,
      vehicleType: "car",
      createdAt: now,
      updatedAt: now,
      source: "vehicle",
    }));

    const mappedBikes = bikeBrands.map((name) => ({
      _id: `vehicle:bike:${name}`,
      name,
      slug: toSlug(name),
      description: undefined,
      logo: null,
      website: undefined,
      email: undefined,
      phone: undefined,
      status: "active",
      featured: false,
      visibleOnHome: false,
      orderIndex: 0,
      productsCount: 0,
      vehicleType: "bike",
      createdAt: now,
      updatedAt: now,
      source: "vehicle",
    }));

    const brands = [...mappedCars, ...mappedBikes];

    // Log activity (non-critical)
    await AuditLog.logActivity({
      actorId: req.user?._id,
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: "read",
      entity: "brand",
      entityId: "vehicle-all",
      entityTitle: "Vehicle Brands (Car+Bike)",
      metadata: {
        carCount: carBrands.length,
        bikeCount: bikeBrands.length,
      },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: req.sessionID,
      severity: "low",
    });

    return res.json({
      success: true,
      data: {
        brands,
        counts: {
          total: brands.length,
          cars: carBrands.length,
          bikes: bikeBrands.length,
        },
      },
    });
  } catch (error) {
    console.error("Get vehicle brands error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle brands",
    });
  }
};

module.exports = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
  getBrandStats,
  getBrandProducts,
  toggleBrandVisibility,
  reorderBrands,
  bulkUpdateBrands,
  getVehicleBrands,
};
