import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";
import { analyticsApi } from "@/api/admin";
import {
  Users,
  Wrench,
  Package,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalServices: number;
  activeServices: number;
  totalProducts: number;
  totalOrders: number;
  totalBookings: number;
  totalBrands: number;
  pendingPayments: number;
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
}

interface ChartData {
  name: string;
  value: number;
  revenue?: number;
  orders?: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export const AdminDashboard: React.FC = () => {
  const { user } = useAdmin();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [serviceData, setServiceData] = useState<ChartData[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Making analytics API call...");
        const response = await analyticsApi.getDashboardStats();
        console.log("Dashboard API Response:", response);
        console.log("Response status:", response.status);
        console.log("Response data structure:", response.data);

        // Handle different response structures
        const data = response.data?.data || response.data;
        console.log("Processed data:", data);

        if (!data) {
          throw new Error("No data received from API");
        }

        // Set stats with fallback values
        setStats({
          totalUsers: data.overview?.totalUsers || 0,
          activeUsers: data.overview?.activeUsers || 0,
          totalServices: data.overview?.totalServices || 0,
          activeServices: data.overview?.activeServices || 0,
          totalProducts: data.overview?.totalProducts || 0,
          totalOrders: data.overview?.totalOrders || 0,
          totalBookings: data.overview?.totalBookings || 0,
          totalBrands: data.overview?.totalBrands || 0,
          pendingPayments: data.overview?.pendingPayments || 0,
          revenue: data.revenue || { current: 0, previous: 0, growth: 0 },
        });

        // Format revenue chart data
        const formattedRevenueData = (data.monthlyRevenue || []).map(
          (item: any) => ({
            name: new Date(
              item._id.year,
              item._id.month - 1
            ).toLocaleDateString("en-US", { month: "short" }),
            revenue: item.revenue || 0,
            orders: item.orders || 0,
          })
        );
        setRevenueData(formattedRevenueData);

        // Format service data
        const formattedServiceData = (data.serviceStats || []).map(
          (item: any) => ({
            name: item.title || "Unknown Service",
            value: item.totalSold || 0,
            revenue: item.totalRevenue || 0,
          })
        );
        setServiceData(formattedServiceData);

        setRecentOrders(data.recentOrders || []);
        setRecentActivity(data.recentActivity || []);
      } catch (err: any) {
        console.error("Error loading dashboard data:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load dashboard data"
        );

        // Set default stats on error
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalServices: 0,
          activeServices: 0,
          totalProducts: 0,
          totalOrders: 0,
          totalBookings: 0,
          totalBrands: 0,
          pendingPayments: 0,
          revenue: { current: 0, previous: 0, growth: 0 },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Services",
      value: stats?.activeServices || 0,
      change: "+5%",
      changeType: "positive" as const,
      icon: Wrench,
      color: "green",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      change: "+8%",
      changeType: "positive" as const,
      icon: Package,
      color: "purple",
    },
    {
      title: "Monthly Revenue",
      value: `₹${(stats?.revenue?.current || 0).toLocaleString()}`,
      change: stats?.revenue?.growth
        ? `+${stats.revenue.growth.toFixed(1)}%`
        : "+0%",
      changeType:
        (stats?.revenue?.growth || 0) >= 0
          ? ("positive" as const)
          : ("negative" as const),
      icon: DollarSign,
      color: "emerald",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || "Admin"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    card.color === "blue" && "bg-blue-100 text-blue-600",
                    card.color === "green" && "bg-green-100 text-green-600",
                    card.color === "purple" && "bg-purple-100 text-purple-600",
                    card.color === "emerald" &&
                      "bg-emerald-100 text-emerald-600"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className="flex items-center text-sm">
                  {card.changeType === "positive" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={cn(
                      "ml-1",
                      card.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Service Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity: any, index: number) => (
                <div
                  key={activity._id || index}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        activity.resource === "USER" && "bg-blue-500",
                        activity.resource === "SERVICE" && "bg-green-500",
                        activity.resource === "ORDER" && "bg-purple-500",
                        activity.resource === "PRODUCT" && "bg-yellow-500",
                        activity.resource === "PAYMENT" && "bg-emerald-500",
                        activity.resource === "AUTH" && "bg-indigo-500",
                        activity.resource === "ANALYTICS" && "bg-pink-500"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activity.action} {activity.resource?.toLowerCase()}
                      {activity.targetName && ` - ${activity.targetName}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {activity.adminId?.name || "Admin"} •{" "}
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-gray-500 py-4">
                No recent activity found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Orders
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber || order._id?.slice(-6) || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.name || order.customerName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹
                      {order.total?.toLocaleString() ||
                        order.amount?.toLocaleString() ||
                        0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                          order.paymentStatus === "paid" &&
                            "bg-green-100 text-green-800",
                          order.paymentStatus === "pending" &&
                            "bg-yellow-100 text-yellow-800",
                          order.paymentStatus === "failed" &&
                            "bg-red-100 text-red-800"
                        )}
                      >
                        {order.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            icon={<Wrench className="h-8 w-8 text-gray-400 mx-auto mb-2" />}
            label="Add New Service"
            onClick={() =>
              navigate("/admin/services", { state: { openCreate: true } })
            }
            colorClass="hover:border-blue-500 hover:bg-blue-50"
          />

          <QuickAction
            icon={<Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />}
            label="Add New Product"
            onClick={() =>
              navigate("/admin/products", { state: { openCreate: true } })
            }
            colorClass="hover:border-green-500 hover:bg-green-50"
          />

          <QuickAction
            icon={<Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />}
            label="View All Users"
            onClick={() => navigate("/admin/users")}
            colorClass="hover:border-purple-500 hover:bg-purple-50"
          />
        </div>
      </div>
    </div>
  );
};

// Small QuickAction helper component to keep markup clean
const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  colorClass?: string;
}> = ({ icon, label, onClick, colorClass }) => {
  return (
    <button
      onClick={onClick}
      className={
        "p-4 border-2 border-dashed border-gray-300 rounded-lg transition-colors focus:outline-none " +
        (colorClass || "")
      }
      aria-label={label}
      type="button"
    >
      {icon}
      <p className="text-sm font-medium text-gray-900">{label}</p>
    </button>
  );
};
