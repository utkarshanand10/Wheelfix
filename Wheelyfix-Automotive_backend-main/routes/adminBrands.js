const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/adminBrandsController");
const { verifyToken, requirePermission } = require("../middleware/adminAuth");
const { validateBrand } = require("../middleware/validateAdmin");

// Apply authentication to all routes
router.use(verifyToken);

// Get all brands
router.get("/", requirePermission("manage_brands"), getBrands);

// Get brand statistics
router.get("/stats", requirePermission("view_reports"), getBrandStats);

// Get aggregated vehicle brands (cars + bikes)
router.get(
  "/vehicle/all",
  requirePermission("manage_brands"),
  getVehicleBrands
);

// Get single brand
router.get("/:id", requirePermission("manage_brands"), getBrandById);

// Get brand products
router.get(
  "/:id/products",
  requirePermission("manage_brands"),
  getBrandProducts
);

// Create new brand
router.post(
  "/",
  requirePermission("manage_brands"),
  validateBrand,
  createBrand
);

// Update brand
router.put(
  "/:id",
  requirePermission("manage_brands"),
  validateBrand,
  updateBrand
);

// Delete brand
router.delete("/:id", requirePermission("manage_brands"), deleteBrand);

// Toggle brand status
router.patch(
  "/:id/status",
  requirePermission("manage_brands"),
  toggleBrandStatus
);

// Toggle brand visibility on home page
router.patch(
  "/:id/visibility",
  requirePermission("manage_brands"),
  toggleBrandVisibility
);

// Reorder brands
router.patch("/reorder", requirePermission("manage_brands"), reorderBrands);

// Bulk update brands
router.patch(
  "/bulk-update",
  requirePermission("manage_brands"),
  bulkUpdateBrands
);

module.exports = router;
