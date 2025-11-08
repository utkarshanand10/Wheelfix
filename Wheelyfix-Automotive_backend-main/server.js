const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
// const connectDB = require('./config/db');
const { connect } = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const brandRoutes = require("./routes/brandRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const cmsRoutes = require("./routes/cmsRoutes");
const auditRoutes = require("./routes/auditRoutes");
const vehicleServicesRoutes = require("./routes/vehicleServices");
const carDataRoutes = require("./routes/carDataRoutes");
const carsRoutes = require("./routes/cars");
const servicesRoutes = require("./routes/services");
const carServicesRoutes = require("./routes/carServices");
const bikeServicesRoutes = require("./routes/bikeServices");

// Admin routes
const adminAuthRoutes = require("./routes/adminAuth");
const adminUsersRoutes = require("./routes/adminUsers");
const adminServicesRoutes = require("./routes/adminServices");
const adminProductsRoutes = require("./routes/adminProducts");
const adminBrandsRoutes = require("./routes/adminBrands");
const adminOrdersRoutes = require("./routes/adminOrders");
const adminSettingsRoutes = require("./routes/adminSettings");
const adminMediaRoutes = require("./routes/adminMedia");
const adminAnalyticsRoutes = require("./routes/adminAnalytics");

dotenv.config();
// Basic environment checks and helpful warnings
if (!process.env.JWT_SECRET) {
  const msg =
    "Warning: JWT_SECRET is not set. Authentication routes that sign JWTs will fail. Copy `env.example` to `.env` and set `JWT_SECRET` and optionally `JWT_REFRESH_SECRET`.";
  if (process.env.NODE_ENV === "production") {
    console.error(msg);
    // In production we prefer to fail fast to avoid running with insecure defaults
    process.exit(1);
  } else {
    console.warn(msg);
  }
}
// Ensure JWT secrets exist. In production we fail fast. In development, fall back to a
// temporary developer secret so auth endpoints remain usable without blocking work.
if (!process.env.JWT_SECRET) {
  const msg =
    "JWT_SECRET is not set. Copy `env.example` to `.env` and set a long, random JWT_SECRET (and optionally JWT_REFRESH_SECRET).";
  if (process.env.NODE_ENV === "production") {
    console.error(msg);
    process.exit(1);
  } else {
    console.warn(
      `Warning: ${msg} Using a temporary development JWT secret for now.`
    );
    // WARNING: This default is only for local development convenience. Do NOT use
    // this value in staging/production. It is intentionally simple to prompt
    // replacement by developers.
    process.env.JWT_SECRET =
      process.env.JWT_SECRET || "dev_jwt_secret_change_me";
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  }
}

connect(); // Connect to MongoDB
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  credentials: process.env.CORS_CREDENTIALS === "true" || true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/vehicle-services", vehicleServicesRoutes);
app.use("/api/car-data", carDataRoutes);
app.use("/api/cars", carsRoutes);
app.use("/api/bikes", require("./routes/bikes"));
app.use("/api/getCarServices", carServicesRoutes);
app.use("/api/getBikeServices", bikeServicesRoutes);

// Admin routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/services", adminServicesRoutes);
app.use("/api/admin/products", adminProductsRoutes);
app.use("/api/admin/brands", adminBrandsRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/media", adminMediaRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// Serve static files from the public directory
app.use(express.static("public"));

// Handle 404 errors - Keep this before the error handler
app.use((req, res, next) => {
  res.status(404).json({
    title: "404 - Page Not Found",
    message: "Oops! The page you're looking for doesn't exist.",
    redirectUrl: "/",
    redirectText: "Return to Home",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Please stop the other process or set PORT to a different value.`
      );
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
