import React, { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { brandsApi } from "@/api/admin";
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
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Building2,
  Package,
  ExternalLink,
  EyeOff,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "sonner";

interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo: {
    url: string;
    alt: string;
  };
  website?: string;
  email?: string;
  phone?: string;
  status: string;
  featured: boolean;
  visibleOnHome: boolean;
  orderIndex: number;
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface BrandStats {
  totalBrands: number;
  activeBrands: number;
  inactiveBrands: number;
  pendingBrands: number;
  featuredBrands: number;
}

export const AdminBrands: React.FC = () => {
  const { hasPermission } = useAdmin();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<BrandStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    featured: "",
    source: "vehicle" as "db" | "vehicle",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 0,
    total: 0,
    limit: 10,
  });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [brandForm, setBrandForm] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    status: "active",
    featured: false,
    visibleOnHome: false,
    logoUrl: "",
    logoAlt: "",
  });

  // Check permissions
  if (!hasPermission("manage_brands")) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to manage brands.
          </p>
        </div>
      </div>
    );
  }

  const loadBrands = async () => {
    try {
      setLoading(true);
      if (filters.source === "vehicle") {
        const response = await brandsApi.getVehicleBrands();
        const allRaw = (response?.data?.data?.brands ||
          response?.data?.brands ||
          response?.data ||
          []) as any[];
        // Normalize vehicle brands into Brand-like objects
        const all = (Array.isArray(allRaw) ? allRaw : []).map((b: any, i) => {
          const name =
            (typeof b === "string" && b) ||
            b?.name ||
            b?.brand ||
            `Brand ${i + 1}`;
          const vehicleType =
            (b?.vehicleType &&
              String(b.vehicleType).toLowerCase().includes("bike") &&
              "bike") ||
            (b?.vehicleType &&
              String(b.vehicleType).toLowerCase().includes("car") &&
              "car") ||
            b?.type ||
            "";
        return {
            _id: `veh_${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            name,
            slug: (name || "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
            description: "",
            // Only include logo when a valid URL exists to avoid alt-text duplicating the name
            logo: b?.logo?.url ? b.logo : undefined,
            website: "",
            email: "",
            phone: "",
            status: "active",
            featured: false,
            visibleOnHome: false,
            orderIndex: i,
            productsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            vehicleType,
          } as any;
        });
        const filtered = search
          ? all.filter((b: any) =>
              `${b.name}`.toLowerCase().includes(search.toLowerCase())
            )
          : all;
        const total = filtered.length;
        const start = (pagination.current - 1) * pagination.limit;
        const end = start + pagination.limit;
        const pageItems = filtered.slice(start, end);
        setBrands(pageItems as any);
        setPagination((prev) => ({
          ...prev,
          total,
          pages: Math.max(1, Math.ceil(total / prev.limit)),
        }));
      } else {
        const params = {
          page: pagination.current,
          limit: pagination.limit,
          search: search || undefined,
          status: filters.status,
          featured: filters.featured,
        } as any;
        const response = await brandsApi.getBrands(params);
        const data = response?.data?.data || response?.data || {};
        setBrands(data.brands || []);
        setPagination(
          data.pagination || {
            current: 1,
            pages: 0,
            total: (data.brands || []).length,
            limit: 10,
          }
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await brandsApi.getBrandStats();
      const root: any = response?.data || {};
      const container =
        root.data && typeof root.data === "object" ? root.data : root;
      setStats(container.overview || null);
    } catch (error: any) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    loadBrands();
    if (filters.source === "db") {
      loadStats();
    }
  }, [pagination.current, search, filters]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Sentinel mapping: UI 'all-*' values -> empty string for API; raw '' from API -> 'all-*' for Select
  const sentinelMap: Record<string, string> = {
    status: "all-status",
    featured: "all-featured",
  };
  const normalizeSelectValue = (key: keyof typeof filters, value: string) => {
    if (value === "" && key !== "source") return sentinelMap[key] || "";
    return value;
  };
  const denormalizeSelectValue = (key: keyof typeof filters, value: string) => {
    if (value === sentinelMap[key]) return "";
    return value;
  };
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: denormalizeSelectValue(key as any, value),
    }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      await brandsApi.deleteBrand(id);
      toast.success("Brand deleted successfully");
      loadBrands();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete brand");
    }
  };

  // Import a vehicle brand (from JSON datasets) into the database so it can be edited/deleted
  const importVehicleBrand = async (vehBrand: any) => {
    try {
      const payload: any = {
        name: vehBrand.name,
        slug:
          vehBrand.slug ||
          String(vehBrand.name || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        description: vehBrand.description || "",
        logo: vehBrand.logo?.url ? vehBrand.logo : undefined,
        website: vehBrand.website || "",
        email: vehBrand.email || "",
        phone: vehBrand.phone || "",
        status: "active",
        featured: false,
        visibleOnHome: false,
        orderIndex: 0,
        type: vehBrand.vehicleType || undefined,
      };
      await brandsApi.createBrand(payload);
      toast.success("Brand added to database. You can now edit/delete it.");
      // Switch to DB view to allow editing immediately
      setFilters((prev) => ({ ...prev, source: "db" }));
      setPagination((p) => ({ ...p, current: 1 }));
      await loadBrands();
      await loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to import brand");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      await brandsApi.toggleBrandStatus(id, newStatus);
      toast.success(`Brand ${newStatus}d successfully`);
      loadBrands();
      loadStats();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update brand status"
      );
    }
  };

  const toggleVisibility = async (brandId: string, visible: boolean) => {
    try {
      await brandsApi.toggleBrandVisibility(brandId, {
        visibleOnHome: visible,
      });
      toast.success(`Brand ${visible ? "shown" : "hidden"} on home page`);
      loadBrands();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to toggle visibility"
      );
    }
  };

  const reorderBrands = async (
    brandOrders: { id: string; orderIndex: number }[]
  ) => {
    try {
      setIsReordering(true);
      await brandsApi.reorderBrands(brandOrders);
      toast.success("Brands reordered successfully");
      loadBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reorder brands");
    } finally {
      setIsReordering(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      inactive: { color: "bg-red-100 text-red-800", label: "Inactive" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
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
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600">Manage your product brands</p>
        </div>
        <Button onClick={() => {
          setEditingBrand(null);
          setBrandForm({
            name: "",
            slug: "",
            description: "",
            website: "",
            email: "",
            phone: "",
            status: "active",
            featured: false,
            visibleOnHome: false,
            logoUrl: "",
            logoAlt: "",
          });
          setShowCreateDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && filters.source === "db" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Brands
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBrands}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeBrands} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Brands
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBrands}</div>
              <p className="text-xs text-muted-foreground">
                {stats.inactiveBrands} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Featured Brands
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.featuredBrands}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingBrands} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {brands.reduce(
                  (sum, brand) => sum + (brand.productsCount || 0),
                  0
                )}
              </div>
              <p className="text-xs text-muted-foreground">Across all brands</p>
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
                  placeholder="Search brands..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.source}
                onValueChange={(value) => handleFilterChange("source", value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="db">Database</SelectItem>
                  <SelectItem value="vehicle">Vehicle (Car + Bike)</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={normalizeSelectValue("status", filters.status)}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={normalizeSelectValue("featured", filters.featured)}
                onValueChange={(value) => handleFilterChange("featured", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-featured">All</SelectItem>
                  <SelectItem value="true">Featured</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brands Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    disabled={filters.source === "vehicle"}
                    checked={
                      filters.source === "vehicle"
                        ? false
                        : selectedBrands.length === brands.length &&
                          brands.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrands(brands.map((b) => b._id));
                      } else {
                        setSelectedBrands([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Type</TableHead>
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
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No brands found
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => (
                  <TableRow key={brand._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        disabled={filters.source === "vehicle"}
                        checked={
                          filters.source === "vehicle"
                            ? false
                            : selectedBrands.includes(brand._id)
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands((prev) => [...prev, brand._id]);
                          } else {
                            setSelectedBrands((prev) =>
                              prev.filter((id) => id !== brand._id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {brand.logo && (brand as any).logo.url ? (
                          <img
                            src={(brand as any).logo?.url}
                            alt={(brand as any).logo?.alt || brand.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{brand.name}</div>
                          <div className="text-sm text-gray-500">
                            {brand.slug}
                            {(brand as any).vehicleType
                              ? ` • ${(brand as any).vehicleType}`
                              : ""}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {brand.description || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visit
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span>{brand.productsCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(brand.status || "active")}
                    </TableCell>
                    <TableCell>
                      {brand.featured ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(brand as any).vehicleType ? (
                        <Badge className="bg-blue-100 text-blue-800 capitalize">
                          {(brand as any).vehicleType}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">DB</span>
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
                          {filters.source === "vehicle" ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => importVehicleBrand(brand as any)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add to Database
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem
                                onClick={() => setEditingBrand(brand)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingBrand(brand)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleStatus(brand._id, brand.status)
                                }
                              >
                                {brand.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteBrand(brand._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
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

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingBrand}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingBrand(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? "Edit Brand" : "Create New Brand"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={brandForm.name}
                  onChange={(e) =>
                    setBrandForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={brandForm.slug}
                  onChange={(e) =>
                    setBrandForm((p) => ({ ...p, slug: e.target.value }))
                  }
                  placeholder="auto-generated from name if empty"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={brandForm.description}
                  onChange={(e) =>
                    setBrandForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={brandForm.website}
                  onChange={(e) =>
                    setBrandForm((p) => ({ ...p, website: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={brandForm.email}
                  onChange={(e) =>
                    setBrandForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={brandForm.phone}
                  onChange={(e) =>
                    setBrandForm((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={brandForm.status}
                  onValueChange={(v) =>
                    setBrandForm((p) => ({ ...p, status: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Logo URL</label>
                <Input
                  value={brandForm.logoUrl}
                  onChange={(e) =>
                    setBrandForm((p) => ({ ...p, logoUrl: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Logo Alt</label>
                <Input
                  value={brandForm.logoAlt}
                  onChange={(e) =>
                    setBrandForm((p) => ({ ...p, logoAlt: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={brandForm.featured}
                  onChange={(e) =>
                    setBrandForm((p) => ({ ...p, featured: e.target.checked }))
                  }
                />
                <span>Featured</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={brandForm.visibleOnHome}
                  onChange={(e) =>
                    setBrandForm((p) => ({
                      ...p,
                      visibleOnHome: e.target.checked,
                    }))
                  }
                />
                <span>Visible on Home</span>
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingBrand(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const payload: any = {
                      name: brandForm.name.trim(),
                      slug:
                        brandForm.slug.trim() ||
                        brandForm.name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, ""),
                      description: brandForm.description,
                      website: brandForm.website,
                      email: brandForm.email,
                      phone: brandForm.phone,
                      status: brandForm.status,
                      featured: brandForm.featured,
                      visibleOnHome: brandForm.visibleOnHome,
                      ...(brandForm.logoUrl
                        ? { logo: { url: brandForm.logoUrl, alt: brandForm.logoAlt || brandForm.name } }
                        : {}),
                    };
                    if (editingBrand) {
                      await brandsApi.updateBrand(editingBrand._id, payload);
                    } else {
                      await brandsApi.createBrand(payload);
                    }
                    setShowCreateDialog(false);
                    setEditingBrand(null);
                    await loadBrands();
                    await loadStats();
                  } catch (error: any) {
                    toast.error(
                      error?.response?.data?.message || "Failed to save brand"
                    );
                  }
                }}
              >
                {editingBrand ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
