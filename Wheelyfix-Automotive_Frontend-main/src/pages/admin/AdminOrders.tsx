import React, { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { ordersApi } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Eye,
  CreditCard,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  items: Array<{
    type: "service" | "product";
    itemId: string;
    title: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  subtotal: number;
  tax: {
    amount: number;
    rate: number;
    type: string;
  };
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  billingAddress: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  orderCount: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidOrders: number;
  pendingPayments: number;
  refundedOrders: number;
}

export const AdminOrders: React.FC = () => {
  const { hasPermission } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    paymentMethod: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 0,
    total: 0,
    limit: 10,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  // Check permissions
  if (!hasPermission("manage_orders")) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to manage orders.
          </p>
        </div>
      </div>
    );
  }

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        search: search || undefined,
        ...filters,
      };

      const response = await ordersApi.getOrders(params);
      const root: any = response?.data || {};
      const container =
        root.data && typeof root.data === "object" ? root.data : root;
      const ordList: any[] = Array.isArray(container.orders)
        ? container.orders
        : Array.isArray(container.data?.orders)
          ? container.data.orders
          : [];
      const pag = container.pagination || container.data?.pagination || null;
      setOrders(
        ordList.map((o) => ({
          ...o,
          user: o.user || {
            _id: "",
            name: "Unknown",
            email: "",
            phoneNumber: "",
          },
          items: Array.isArray(o.items) ? o.items : [],
        }))
      );
      if (pag) setPagination(pag);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await ordersApi.getOrderStats();
      const root: any = response?.data || {};
      const container =
        root.data && typeof root.data === "object" ? root.data : root;
      setStats(container.overview || null);
    } catch (error: any) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [pagination.current, search, filters]);

  // Lightweight realtime: poll for new orders every 10s and reset to first page if new items appear
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const params = {
          page: 1,
          limit: pagination.limit,
          search: search || undefined,
          ...filters,
        } as any;
        const response = await ordersApi.getOrders(params);
        const root: any = response?.data || {};
        const container =
          root.data && typeof root.data === "object" ? root.data : root;
        const latest: any[] = Array.isArray(container.orders)
          ? container.orders
          : Array.isArray(container.data?.orders)
          ? container.data.orders
          : [];
        // If the first item changed, refresh the current view and stats
        if (
          latest.length > 0 &&
          (!orders.length || latest[0]?._id !== orders[0]?._id)
        ) {
          setPagination((prev) => ({ ...prev, current: 1 }));
          loadOrders();
          loadStats();
        }
      } catch {
        // ignore polling errors
      }
    }, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, filters, search, pagination.limit]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Radix Select requires non-empty values in SelectItem; use 'all' sentinel mapping
  const normalizeSelectValue = (v: string) => (v === "" ? "all" : v);
  const denormalizeSelectValue = (v: string) => (v === "all" ? "" : v);

  const handleViewOrder = async (orderId: string) => {
    try {
      const response = await ordersApi.getOrderById(orderId);
      const root: any = response?.data || {};
      const container =
        root.data && typeof root.data === "object" ? root.data : root;
      setSelectedOrder(container.order || null);
      setShowOrderDialog(true);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load order details"
      );
    }
  };

  const handleCapturePayment = async (orderId: string) => {
    if (!confirm("Are you sure you want to capture this payment?")) return;

    try {
      await ordersApi.capturePayment(orderId);
      toast.success("Payment captured successfully");
      loadOrders();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to capture payment");
    }
  };

  const handleRefundOrder = async (orderId: string) => {
    const amount = prompt("Enter refund amount:");
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    const reason = prompt("Enter refund reason:");
    if (!reason) {
      toast.error("Please enter a refund reason");
      return;
    }

    try {
      await ordersApi.refundOrder(orderId, { amount: Number(amount), reason });
      toast.success("Refund processed successfully");
      loadOrders();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process refund");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      processing: {
        color: "bg-purple-100 text-purple-800",
        label: "Processing",
      },
      shipped: { color: "bg-indigo-100 text-indigo-800", label: "Shipped" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      refunded: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      paid: { color: "bg-green-100 text-green-800", label: "Paid" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
      refunded: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
      partially_refunded: {
        color: "bg-orange-100 text-orange-800",
        label: "Partially Refunded",
      },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders and payments</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.totalRevenue?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg: ₹{stats.averageOrderValue?.toFixed(0) || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingPayments} pending payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deliveredOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.shippedOrders} shipped
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={normalizeSelectValue(filters.status)}
                onValueChange={(value) =>
                  handleFilterChange("status", denormalizeSelectValue(value))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={normalizeSelectValue(filters.paymentStatus)}
                onValueChange={(value) =>
                  handleFilterChange(
                    "paymentStatus",
                    denormalizeSelectValue(value)
                  )
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={normalizeSelectValue(filters.paymentMethod)}
                onValueChange={(value) =>
                  handleFilterChange(
                    "paymentMethod",
                    denormalizeSelectValue(value)
                  )
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-sm">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.user.name}</div>
                        <div className="text-sm text-gray-500">
                          {order.user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user.phoneNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                        <div className="text-gray-500">
                          {order.items
                            .slice(0, 2)
                            .map((item) => item.title)
                            .join(", ")}
                          {order.items.length > 2 &&
                            ` +${order.items.length - 2} more`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{order.total.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getPaymentStatusBadge(order.paymentStatus)}
                        <div className="text-xs text-gray-500 capitalize">
                          {order.paymentMethod.replace("_", " ")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                        <div className="text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewOrder(order._id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {order.paymentStatus === "pending" && (
                            <DropdownMenuItem
                              onClick={() => handleCapturePayment(order._id)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Capture Payment
                            </DropdownMenuItem>
                          )}
                          {order.paymentStatus === "paid" && (
                            <DropdownMenuItem
                              onClick={() => handleRefundOrder(order._id)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refund
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(pagination.current - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.current * pagination.limit, pagination.total)}{" "}
            of {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current === 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  current: prev.current - 1,
                }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current === pagination.pages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  current: prev.current + 1,
                }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>Name:</strong> {selectedOrder.user.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedOrder.user.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {selectedOrder.user.phoneNumber}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>Order Number:</strong>{" "}
                        {selectedOrder.orderNumber}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {getStatusBadge(selectedOrder.status)}
                      </p>
                      <p>
                        <strong>Payment Status:</strong>{" "}
                        {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                      </p>
                      <p>
                        <strong>Payment Method:</strong>{" "}
                        {selectedOrder.paymentMethod}
                      </p>
                      <p>
                        <strong>Total:</strong> ₹
                        {selectedOrder.total.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.title}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800 capitalize">
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>₹{item.price.toLocaleString()}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
