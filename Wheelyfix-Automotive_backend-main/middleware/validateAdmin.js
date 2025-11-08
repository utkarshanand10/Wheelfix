const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
      errors: errors.array()
      });
    }
    next();
};

// Product validation
const validateProduct = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters')
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, hyphens, and underscores'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('brand')
    .isMongoId()
    .withMessage('Brand must be a valid MongoDB ObjectId'),
  
  body('category')
    .isIn([
      'Engine Parts', 'Brake Parts', 'Suspension Parts', 'Electrical Parts',
      'Body Parts', 'Interior Parts', 'Exterior Parts', 'Accessories',
      'Tools', 'Fluids', 'Other'
    ])
    .withMessage('Invalid category'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft', 'archived'])
    .withMessage('Invalid status'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('popular')
    .optional()
    .isBoolean()
    .withMessage('Popular must be a boolean'),
  
  handleValidationErrors
];

// Brand validation
const validateBrand = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Brand name is required')
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('logo.url')
    .notEmpty()
    .withMessage('Logo URL is required')
    .isURL()
    .withMessage('Logo must be a valid URL'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Invalid status'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  handleValidationErrors
];

// Order validation
const validateOrder = [
  body('status')
    .optional()
    .isIn([
      'pending', 'confirmed', 'processing', 'shipped',
      'delivered', 'cancelled', 'refunded', 'failed'
    ])
    .withMessage('Invalid order status'),
  
  body('paymentStatus')
    .optional()
    .isIn([
      'pending', 'paid', 'failed', 'refunded',
      'partially_refunded', 'cancelled'
    ])
    .withMessage('Invalid payment status'),
  
  body('billingAddress.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Billing name is required if billing address is provided'),
  
  body('billingAddress.email')
    .optional()
    .isEmail()
    .withMessage('Billing email must be valid'),
  
  body('shippingAddress.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Shipping name is required if shipping address is provided'),
  
  body('notes.admin')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Settings validation
const validateSettings = [
  body('company.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  
  body('company.email')
    .optional()
    .isEmail()
    .withMessage('Company email must be valid'),
  
  body('company.phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Company phone must be valid'),
  
  body('payment.currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP'])
    .withMessage('Invalid currency'),
  
  body('payment.taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  
  body('site.title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Site title cannot exceed 200 characters'),
  
  body('site.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Site description cannot exceed 500 characters'),
  
  body('site.maintenanceMode')
    .optional()
    .isBoolean()
    .withMessage('Maintenance mode must be a boolean'),
  
  handleValidationErrors
];

  // User validation
const validateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('phoneNumber')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('role')
    .optional()
    .isIn(['customer', 'admin', 'manager', 'superadmin'])
    .withMessage('Invalid role'),
  
  body('status')
    .optional()
    .isIn(['active', 'suspended', 'inactive'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];

  // Service validation
const validateService = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),
  
  body('durationMinutes')
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes'),
  
  body('category')
    .isIn([
      'General Service', 'Engine Service', 'Brake Service', 'Suspension Service',
      'Electrical Service', 'Body Work', 'Interior Service', 'Exterior Service',
      'Diagnostic', 'Emergency', 'Other'
    ])
    .withMessage('Invalid category'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft', 'archived'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort field must be between 1 and 50 characters'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
];

  // ID parameter validation
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Bulk action validation
const validateBulkAction = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs must be an array with at least one item'),
  
  body('ids.*')
    .isMongoId()
    .withMessage('Each ID must be a valid MongoDB ObjectId'),
  
  handleValidationErrors
];

// Auth validation schemas
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors
];

const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  
  handleValidationErrors
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  handleValidationErrors
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

// Additional validation schemas
const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort field must be between 1 and 50 characters'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
];

const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('phoneNumber')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('role')
    .optional()
    .isIn(['customer', 'admin', 'manager', 'superadmin'])
    .withMessage('Invalid role'),
  
  handleValidationErrors
];

const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('phoneNumber')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('role')
    .optional()
    .isIn(['customer', 'admin', 'manager', 'superadmin'])
    .withMessage('Invalid role'),
  
  body('status')
    .optional()
    .isIn(['active', 'suspended', 'inactive'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];

const validateToggleUserStatus = [
  body('status')
    .isIn(['active', 'suspended', 'inactive'])
    .withMessage('Status must be active, suspended, or inactive'),
  
  handleValidationErrors
];

const validateResetPassword = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

// Additional validation schemas for services
const validateCreateService = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Service title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Service title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Service description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Service description must be between 10 and 2000 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (in minutes)'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Service category is required'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  
  handleValidationErrors
];

const validateUpdateService = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Service title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Service description must be between 10 and 2000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (in minutes)'),
  
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Service category cannot be empty'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  
  handleValidationErrors
];

const validateToggleServiceStatus = [
  body('status')
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  
  handleValidationErrors
];

const validateBulkUpdateServices = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs must be an array with at least one item'),
  
  body('ids.*')
    .isMongoId()
    .withMessage('Each ID must be a valid MongoDB ObjectId'),
  
  body('updates')
    .isObject()
    .withMessage('Updates must be an object'),
  
  handleValidationErrors
];

// Export schemas object for route usage
const schemas = {
  login: validateLogin,
  refreshToken: validateRefreshToken,
  updateProfile: validateUpdateProfile,
  changePassword: validateChangePassword,
  pagination: validatePaginationQuery,
  mongoId: validateMongoId,
  createUser: validateCreateUser,
  updateUser: validateUpdateUser,
  toggleUserStatus: validateToggleUserStatus,
  resetPassword: validateResetPassword,
  createService: validateCreateService,
  updateService: validateUpdateService,
  toggleServiceStatus: validateToggleServiceStatus,
  bulkUpdateServices: validateBulkUpdateServices
};

module.exports = {
  validateProduct,
  validateBrand,
  validateOrder,
  validateSettings,
  validateUser,
  validateService,
  validatePagination,
  validateId,
  validateBulkAction,
  handleValidationErrors,
  schemas
};