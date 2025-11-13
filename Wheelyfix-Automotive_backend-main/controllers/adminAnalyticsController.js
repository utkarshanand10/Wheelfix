const User = require("../models/userModel");
const Service = require("../models/serviceModel");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const Order = require("../models/orderModel");
const AuditLog = require("../models/auditLogModel");

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log("Getting dashboard stats...");
    const { period = "30d" } = req.query;

    let startDate;
    const endDate = new Date();

    switch (period) {
      case "7d":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get basic counts
    const [
      totalUsers,
      activeUsers,
      totalServices,
      activeServices,
      totalProducts,
      activeProducts,
      totalBrands,
      activeBrands,
      totalOrders,
      paidOrders,
      pendingOrders,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      Service.countDocuments(),
      Service.countDocuments({ status: "active" }),
      Product.countDocuments().catch(() => 0),
      Product.countDocuments({ status: "active" }).catch(() => 0),
      Brand.countDocuments(),
      Brand.countDocuments({ status: "active" }),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: "paid" }),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ createdAt: { $gte: startDate } }),
    ]);

    // Get revenue data
    const revenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
          orderCount: { $sum: 1 },
        },
      },
    ]).catch(() => [{ totalRevenue: 0, averageOrderValue: 0, orderCount: 0 }]);

    // Get monthly revenue trend
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]).catch(() => []);

    // Get service popularity
    const serviceStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$items" },
      {
        $match: { "items.type": "service" },
      },
      {
        $group: {
          _id: "$items.itemId",
          title: { $first: "$items.title" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      { $limit: 10 },
    ]).catch(() => []);

    // Get product popularity
    const productStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$items" },
      {
        $match: { "items.type": "product" },
      },
      {
        $group: {
          _id: "$items.itemId",
          title: { $first: "$items.title" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      { $limit: 10 },
    ]).catch(() => []);

    // Get recent activity
    const recentActivity = await AuditLog.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .catch(() => []);

    // Get user growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]).catch(() => []);

    // Log activity
    await AuditLog.log({
      adminId: req.user._id,
      action: "READ",
      resource: "ANALYTICS",
      targetId: "dashboard",
      targetName: "Dashboard Statistics",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      metadata: { period, startDate, endDate },
      severity: "LOW",
    });

    const responseData = {
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalServices,
          activeServices,
          totalProducts,
          activeProducts,
          totalBrands,
          activeBrands,
          totalOrders,
          paidOrders,
          pendingOrders,
          recentOrders,
        },
        revenue: revenueData[0] || {
          totalRevenue: 0,
          averageOrderValue: 0,
          orderCount: 0,
        },
        monthlyRevenue,
        serviceStats,
        productStats,
        recentActivity,
        userGrowth,
        period: {
          start: startDate,
          end: endDate,
          days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
        },
      },
    };

    console.log(
      "Dashboard stats response:",
      JSON.stringify(responseData, null, 2)
    );
    res.json(responseData);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    // Return default data structure on error to prevent frontend crashes
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: 0,
          activeUsers: 0,
          totalServices: 0,
          activeServices: 0,
          totalProducts: 0,
          activeProducts: 0,
          totalBrands: 0,
          activeBrands: 0,
          totalOrders: 0,
          paidOrders: 0,
          pendingOrders: 0,
          recentOrders: [],
        },
        revenue: { totalRevenue: 0, averageOrderValue: 0, orderCount: 0 },
        monthlyRevenue: [],
        serviceStats: [],
        productStats: [],
        recentActivity: [],
        userGrowth: [],
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
          days: 30,
        },
      },
    });
  }
};

// Get revenue chart data
const getRevenueChart = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    let startDate;
    const endDate = new Date();

    switch (period) {
      case "7d":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: "$total" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Format data for chart
    const chartData = revenueData.map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(
        2,
        "0"
      )}-${String(item._id.day).padStart(2, "0")}`,
      revenue: item.revenue,
      orders: item.orders,
      averageOrderValue: Math.round(item.averageOrderValue),
    }));

    res.json({
      success: true,
      data: {
        chartData,
        period: {
          start: startDate,
          end: endDate,
          days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
        },
      },
    });
  } catch (error) {
    console.error("Get revenue chart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue chart data",
    });
  }
};

// Get service chart data
const getServiceChart = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    let startDate;
    const endDate = new Date();

    switch (period) {
      case "7d":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get service sales by category
    const serviceCategoryData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$items" },
      {
        $match: { "items.type": "service" },
      },
      {
        $lookup: {
          from: "services",
          localField: "items.itemId",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $group: {
          _id: "$service.category",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
    ]);

    // Get top services
    const topServices = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$items" },
      {
        $match: { "items.type": "service" },
      },
      {
        $group: {
          _id: "$items.itemId",
          title: { $first: "$items.title" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        categoryData: serviceCategoryData,
        topServices,
        period: {
          start: startDate,
          end: endDate,
          days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
        },
      },
    });
  } catch (error) {
    console.error("Get service chart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service chart data",
    });
  }
};

// Get activity logs
const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      entity, // kept for backward compatibility
      resource,
      severity,
      actorId,
      adminId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object. Support both legacy query names and the canonical fields.
    const filter = {};

    if (action) filter.action = action;
    // 'entity' was used in older code; the actual field in AuditLog is 'resource'
    if (resource) filter.resource = resource.toString().toUpperCase();
    else if (entity) filter.resource = entity.toString().toUpperCase();

    if (severity) filter.severity = severity;

    // support both actorId and adminId query param names
    if (actorId) filter.adminId = actorId;
    if (adminId) filter.adminId = adminId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination, populate admin details
    const logs = await AuditLog.find(filter)
      .populate("adminId", "name email role")
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await AuditLog.countDocuments(filter);

    // Get activity summary grouped by action & resource
    const summary = await AuditLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            action: "$action",
            resource: "$resource",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        logs,
        summary,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit || 1)),
          total,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get activity logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
    });
  }
};

// Export analytics data
const exportAnalytics = async (req, res) => {
  try {
    const { type, format = "csv", period = "30d" } = req.query;

    let startDate;
    const endDate = new Date();

    switch (period) {
      case "7d":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    let data = [];
    let filename = "";

    switch (type) {
      case "orders":
        data = await Order.find({
          createdAt: { $gte: startDate, $lte: endDate },
        })
          .populate("user", "name email")
          .populate("items.itemId")
          .lean();
        filename = `orders_${period}_${new Date().toISOString().split("T")[0]}`;
        break;

      case "users":
        data = await User.find({
          createdAt: { $gte: startDate, $lte: endDate },
        }).lean();
        filename = `users_${period}_${new Date().toISOString().split("T")[0]}`;
        break;

      case "services":
        data = await Service.find({
          createdAt: { $gte: startDate, $lte: endDate },
        })
          .populate("brand", "name")
          .lean();
        filename = `services_${period}_${
          new Date().toISOString().split("T")[0]
        }`;
        break;

      case "products":
        data = await Product.find({
          createdAt: { $gte: startDate, $lte: endDate },
        })
          .populate("brand", "name")
          .lean();
        filename = `products_${period}_${
          new Date().toISOString().split("T")[0]
        }`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid export type",
        });
    }

    // Log export activity
    await AuditLog.log({
      adminId: req.user._id,
      action: "EXPORT",
      resource: "ANALYTICS",
      targetId: type,
      targetName: `${type} Export`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      metadata: {
        format,
        period,
        recordCount: data.length,
      },
      severity: "MEDIUM",
    });

    if (format === "csv") {
      // Convert to CSV (simplified)
      const csv = convertToCSV(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.csv"`
      );
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: {
          records: data,
          count: data.length,
          period: { start: startDate, end: endDate },
        },
      });
    }
  } catch (error) {
    console.error("Export analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export analytics data",
    });
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data) => {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value).replace(/,/g, ";");
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

module.exports = {
  getDashboardStats,
  getRevenueChart,
  getServiceChart,
  getActivityLogs,
  exportAnalytics,
};
