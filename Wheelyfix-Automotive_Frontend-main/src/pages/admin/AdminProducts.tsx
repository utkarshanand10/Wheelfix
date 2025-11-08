import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { productsApi } from "@/api/admin";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  _id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  featured: boolean;
  popular: boolean;
  brand: {
    _id: string;
    name: string;
    logo: { url: string; alt: string };
  };
  primaryImage?: {
    url: string;
    alt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  draftProducts: number;
  featuredProducts: number;
  popularProducts: number;
  totalStock: number;
  lowStockProducts: number;
  averagePrice: number;
  totalValue: number;
}

export const AdminProducts: React.FC = () => {
  const { hasPermission } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    status: "",
    featured: "",
    popular: "",
    lowStock: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 0,
    total: 0,
    limit: 10,
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    sku: "",
    price: 0,
    stock: 0,
    category: "",
    brand: "",
    status: "active",
    featured: false,
    popular: false,
  });

  // Check permissions
  if (!hasPermission("manage_products")) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to manage products.
          </p>
        </div>
      </div>
    );
  }

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        search: search || undefined,
        ...filters,
      };
      const response = await productsApi.getProducts(params);
      // Resilient shape handling: axios response -> response.data may contain { success, data: {...} } or direct data
      const root: any = response?.data || {};
      const container =
        root.data && typeof root.data === "object" ? root.data : root;
      const prodList: any[] = Array.isArray(container.products)
        ? container.products
        : Array.isArray(container.data?.products)
          ? container.data.products
          : [];
      const pag = container.pagination || container.data?.pagination || null;
      setProducts(
        prodList.map((p) => ({
          ...p,
          // defensive brand/primaryImage to avoid runtime errors if backend omits them
          brand: p.brand || {
            _id: "",
            name: "Unknown",
            logo: { url: "", alt: "" },
          },
          primaryImage: p.primaryImage || null,
        }))
      );
      if (pag) setPagination(pag);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await productsApi.getProductStats();
      const root: any = response?.data || {};
      const container =
        root.data && typeof root.data === "object" ? root.data : root;
      setStats(container.overview || null);
    } catch (error: any) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadStats();
  }, [pagination.current, search, filters]);

  // Open create dialog if navigated here with state.openCreate
  useEffect(() => {
    const state: any = (location && (location as any).state) || {};
    if (state.openCreate) {
      setShowCreateDialog(true);
      // clear the state so re-entering doesn't re-open
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setFormState({
        title: editingProduct.title,
        sku: editingProduct.sku,
        price: editingProduct.price,
        stock: editingProduct.stock,
        category: editingProduct.category,
        brand: editingProduct.brand?._id || "",
        status: editingProduct.status,
        featured: !!editingProduct.featured,
        popular: !!editingProduct.popular,
      });
      setShowCreateDialog(true);
    } else {
      setFormState({
        title: "",
        sku: "",
        price: 0,
        stock: 0,
        category: "",
        brand: "",
        status: "active",
        featured: false,
        popular: false,
      });
    }
  }, [editingProduct]);

  const handleFormChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (editingProduct) {
        await productsApi.updateProduct(editingProduct._id, formState);
        toast.success("Product updated");
      } else {
        await productsApi.createProduct(formState);
        toast.success("Product created");
      }
      setShowCreateDialog(false);
      setEditingProduct(null);
      loadProducts();
      loadStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save product");
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Helpers to satisfy Radix Select requirement: no empty string in SelectItem values
  const normalizeSelectValue = (v: string) => (v === "" ? "all" : v);
  const denormalizeSelectValue = (v: string) => (v === "all" ? "" : v);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productsApi.deleteProduct(id);
      toast.success("Product deleted successfully");
      loadProducts();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products first");
      return;
    }

    try {
      let updateData = {};
      switch (action) {
        case "activate":
          updateData = { status: "active" };
          break;
        case "deactivate":
          updateData = { status: "inactive" };
          break;
        case "feature":
          updateData = { featured: true };
          break;
        case "unfeature":
          updateData = { featured: false };
          break;
        case "delete":
          if (
            !confirm(
              `Are you sure you want to delete ${selectedProducts.length} products?`
            )
          )
            return;
          for (const id of selectedProducts) {
            await productsApi.deleteProduct(id);
          }
          toast.success(
            `${selectedProducts.length} products deleted successfully`
          );
          setSelectedProducts([]);
          loadProducts();
          loadStats();
          return;
      }

      await productsApi.bulkUpdateProducts(selectedProducts, updateData);
      toast.success(`Products ${action}d successfully`);
      setSelectedProducts([]);
      loadProducts();
      loadStats();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || `Failed to ${action} products`
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      inactive: { color: "bg-red-100 text-red-800", label: "Inactive" },
      draft: { color: "bg-yellow-100 text-yellow-800", label: "Draft" },
      archived: { color: "bg-gray-100 text-gray-800", label: "Archived" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStockBadge = (stock: number, lowStockThreshold: number = 10) => {
    if (stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
    } else if (stock <= lowStockThreshold) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProducts} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStock}</div>
              <p className="text-xs text-muted-foreground">
                {stats.lowStockProducts} low stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Price
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.averagePrice?.toFixed(0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total value: ₹{stats.totalValue?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.featuredProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.popularProducts} popular
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
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={normalizeSelectValue(filters.category)}
                onValueChange={(value) =>
                  handleFilterChange("category", denormalizeSelectValue(value))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Engine Parts">Engine Parts</SelectItem>
                  <SelectItem value="Brake Parts">Brake Parts</SelectItem>
                  <SelectItem value="Suspension Parts">
                    Suspension Parts
                  </SelectItem>
                  <SelectItem value="Electrical Parts">
                    Electrical Parts
                  </SelectItem>
                  <SelectItem value="Body Parts">Body Parts</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={normalizeSelectValue(filters.status)}
                onValueChange={(value) =>
                  handleFilterChange("status", denormalizeSelectValue(value))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={normalizeSelectValue(filters.featured)}
                onValueChange={(value) =>
                  handleFilterChange("featured", denormalizeSelectValue(value))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Featured</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={normalizeSelectValue(filters.lowStock)}
                onValueChange={(value) =>
                  handleFilterChange("lowStock", denormalizeSelectValue(value))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="true">Low Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("activate")}
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("deactivate")}
                >
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("feature")}
                >
                  Feature
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("unfeature")}
                >
                  Unfeature
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedProducts.length === products.length &&
                      products.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(products.map((p) => p._id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-gray-500"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts((prev) => [
                              ...prev,
                              product._id,
                            ]);
                          } else {
                            setSelectedProducts((prev) =>
                              prev.filter((id) => id !== product._id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {product.primaryImage ? (
                          <img
                            src={product.primaryImage.url}
                            alt={product.primaryImage.alt}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-gray-500">
                            {product.popular && (
                              <Badge className="bg-blue-100 text-blue-800 mr-1">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {product.brand.logo && (
                          <img
                            src={product.brand.logo.url}
                            alt={product.brand.logo.alt}
                            className="h-6 w-6 rounded"
                          />
                        )}
                        <span>{product.brand.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="font-medium">
                      ₹{product.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{product.stock}</span>
                        {getStockBadge(product.stock)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>
                      {product.featured ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
                            onClick={() => setEditingProduct(product)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
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

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingProduct(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Create New Product"}
            </DialogTitle>
          </DialogHeader>
          <form
            className="p-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formState.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={formState.sku}
                  onChange={(e) => handleFormChange("sku", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  value={formState.price}
                  onChange={(e) =>
                    handleFormChange("price", Number(e.target.value))
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <Input
                  type="number"
                  value={formState.stock}
                  onChange={(e) =>
                    handleFormChange("stock", Number(e.target.value))
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formState.category}
                  onChange={(e) => handleFormChange("category", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Brand ID</label>
                <Input
                  value={formState.brand}
                  onChange={(e) => handleFormChange("brand", e.target.value)}
                  placeholder="Brand ObjectId"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formState.status}
                  onValueChange={(v) => handleFormChange("status", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formState.featured}
                    onChange={(e) =>
                      handleFormChange("featured", e.target.checked)
                    }
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formState.popular}
                    onChange={(e) =>
                      handleFormChange("popular", e.target.checked)
                    }
                  />
                  <span>Popular</span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
