import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { servicesApi } from "@/api/admin";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Clock,
  DollarSign,
} from "lucide-react";

interface Service {
  _id: string;
  title: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: string;
  status: string;
  featured: boolean;
  popular: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string;
    email: string;
  };
  primaryImage?: {
    url: string;
    alt: string;
  };
}

interface ServicesResponse {
  services: Service[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const AdminServices: React.FC = () => {
  const { hasPermission } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<
    ServicesResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availableCategoriesState, setAvailableCategoriesState] = useState<
    string[]
  >([]);
  const [dataSource, setDataSource] = useState<"vehicle" | "admin" | null>(
    null
  ); // tracked for future UI messaging
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({});

  // Only show categories that match the vehicle-services list (keeps filter small and relevant)
  const allowedCategories = [
    "Basic",
    "Standard",
    "Premium",
    "AMC",
    "Add-on",
    "Comprehensive",
    "AC",
    "Tyre",
    "Battery",
  ];

  const loadServices = async () => {
    try {
      setIsLoading(true);

      const extractArray = (payload: any): any[] => {
        if (!payload) return [];
        // If API wraps success/data: { success: true, data: { services: [...] } }
        if (payload.success && payload.data) {
          if (Array.isArray(payload.data.services))
            return payload.data.services;
          if (Array.isArray(payload.data)) return payload.data;
        }

        // Vehicle-services returns { success: true, services: [...] }
        if (Array.isArray(payload.services)) return payload.services;

        // Direct array response
        if (Array.isArray(payload)) return payload;

        // nested: { data: { services: [...] } }
        if (payload.data && Array.isArray(payload.data.services))
          return payload.data.services;

        // sometimes payload.data is the array
        if (Array.isArray(payload.data)) return payload.data;

        // try to find first array property
        for (const k of Object.keys(payload)) {
          if (Array.isArray((payload as any)[k])) return (payload as any)[k];
        }

        return [];
      };

      // If brand/model/fuel are selected, ask the vehicle-services endpoint
      let servicesData: any[] = [];
      let usedVehicleEndpoint = false;

      if (selectedBrand && selectedModel && selectedFuel) {
        usedVehicleEndpoint = true;
        const postBody = {
          brand: selectedBrand,
          model: selectedModel,
          fuel: selectedFuel,
        };

        const response = await api.post("/vehicle-services", postBody);
        const vData = response.data;
        servicesData = extractArray(vData);

        // If vehicle-services returns empty, fall back to admin services endpoint
        // This handles cases where brand/model keys differ between the UI and the static JSON
        if (!servicesData || servicesData.length === 0) {
          console.warn(
            "vehicle-services returned empty for this selection, falling back to admin services. shape:",
            vData
          );

          // Build admin params: do not send vehicle-only category names to server
          const params: any = {
            q: searchQuery || undefined,
            // if categoryFilter is one of allowed vehicle categories, don't send it to admin API
            category:
              categoryFilter && !allowedCategories.includes(categoryFilter)
                ? categoryFilter
                : undefined,
            status: statusFilter || undefined,
            vehicleType: vehicleTypeFilter || undefined,
            page: currentPage || undefined,
          };

          try {
            const res = await servicesApi.getServices(params);
            const aData = res.data;
            servicesData = extractArray(aData);
            // set pagination if present
            const pag =
              res.data?.pagination || res.data?.data?.pagination || null;
            if (pag) setPagination(pag);
            usedVehicleEndpoint = false; // we are using admin data now
          } catch (err) {
            console.error("Admin fallback failed:", err);
            servicesData = [];
          }
        }
      } else {
        // Fallback to admin services endpoint so filters work without vehicle selection
        try {
          const params: any = {
            q: searchQuery || undefined,
            // If the selected category is from the vehicle-services list (allowedCategories),
            // don't send it as a server-side category filter because admin categories differ.
            // In that case we'll apply category filtering client-side below.
            category:
              categoryFilter && !allowedCategories.includes(categoryFilter)
                ? categoryFilter
                : undefined,
            status: statusFilter || undefined,
            vehicleType: vehicleTypeFilter || undefined,
            page: currentPage || undefined,
          };
          const res = await servicesApi.getServices(params);
          // admin API may return { services, pagination } or { data: { services } }
          const aData = res.data;
          servicesData = extractArray(aData);
          if (servicesData.length === 0) {
            // try some fallbacks
            if (res.data?.services && !Array.isArray(res.data.services)) {
              console.warn(
                "admin services shape services is not array",
                res.data.services
              );
            }
            if (!servicesData.length)
              console.warn(
                "admin services returned no array data, shape:",
                res.data
              );
          }
          // If pagination present, try to set it
          const pag =
            res.data?.pagination || res.data?.data?.pagination || null;
          if (pag) setPagination(pag);
        } catch (err) {
          console.error("Failed to load admin services fallback:", err);
          servicesData = [];
        }
      }

      // Normalize results — assign a stable local _id when missing and map common fields
      const normalized: any[] = (servicesData as any[]).map(
        (s: any, idx: number) => ({
          // preserve origin fields, provide UI-friendly names
          _id:
            s._id ||
            s.id ||
            `vs_${selectedBrand}_${selectedModel}_${selectedFuel}_${idx}`,
          title: s.title || s.serviceName || s.name || "",
          description: s.description || s.desc || "",
          price: typeof s.price === "number" ? s.price : Number(s.price) || 0,
          durationMinutes:
            s.durationMinutes || s.estimatedTime || s.duration || 60,
          category: s.category || s.type || "General Service",
          status: s.status || "active",
          featured: !!s.featured,
          popular: !!s.popular,
          primaryImage: s.primaryImage || s.image || null,
          raw: s,
        })
      );

      // Build available categories from the unfiltered normalized results (intersection with allowed list)
      try {
        const present = Array.from(
          new Set(
            normalized
              .map((s) => String(s.category || "").trim())
              .filter(Boolean)
          )
        );
        const intersection = allowedCategories.filter((c) =>
          present.map((p) => p.toLowerCase()).includes(c.toLowerCase())
        );
        setAvailableCategoriesState(
          intersection.length > 0 ? intersection : allowedCategories
        );
      } catch (e) {
        setAvailableCategoriesState(allowedCategories);
      }

      // Apply client-side filters so the Filter button and selects are effective
      let filtered: any[] = normalized;

      if (categoryFilter) {
        // If categoryFilter is a vehicle-service category (allowedCategories) but
        // we fell back to admin data (usedVehicleEndpoint === false), skip applying
        // the vehicle-only category filter because admin categories use a different enum.
        const isVehicleCategory = allowedCategories
          .map((c) => c.toLowerCase())
          .includes(String(categoryFilter).toLowerCase());

        if (usedVehicleEndpoint || !isVehicleCategory) {
          filtered = filtered.filter(
            (it: any) =>
              String(it.category).toLowerCase() ===
              String(categoryFilter).toLowerCase()
          );
        } else {
          // Skipping category filter because it's a vehicle-only category and we're showing admin fallback
        }
      }

      if (statusFilter) {
        filtered = filtered.filter(
          (it: any) =>
            String(it.status).toLowerCase() ===
            String(statusFilter).toLowerCase()
        );
      }

      // Only apply these filters to admin data; vehicle endpoint already narrowed by brand/model/fuel
      if (!usedVehicleEndpoint) {
        if (vehicleTypeFilter) {
          filtered = filtered.filter((it: any) => {
            const t = (it.raw && (it.raw.type || it.raw.vehicleType)) || "";
            return (
              String(t).toLowerCase() ===
              String(vehicleTypeFilter).toLowerCase()
            );
          });
        }
      }

      if (!usedVehicleEndpoint) {
        if (selectedBrand) {
          filtered = filtered.filter((it: any) => {
            const b =
              (it.raw &&
                (it.raw.brand || (it.raw.vehicle && it.raw.vehicle.brand))) ||
              "";
            return (
              String(b).toLowerCase() === String(selectedBrand).toLowerCase()
            );
          });
        }
      }

      if (!usedVehicleEndpoint) {
        if (selectedModel) {
          filtered = filtered.filter((it: any) => {
            const m =
              (it.raw &&
                (it.raw.model || (it.raw.vehicle && it.raw.vehicle.model))) ||
              "";
            return (
              String(m).toLowerCase() === String(selectedModel).toLowerCase()
            );
          });
        }
      }

      if (!usedVehicleEndpoint) {
        if (selectedFuel) {
          filtered = filtered.filter((it: any) => {
            const f =
              (it.raw &&
                (it.raw.fuel || (it.raw.vehicle && it.raw.vehicle.fuel))) ||
              "";
            return (
              String(f).toLowerCase() === String(selectedFuel).toLowerCase()
            );
          });
        }
      }

      if (searchQuery) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter((it: any) =>
          (String(it.title) + " " + String(it.description))
            .toLowerCase()
            .includes(q)
        );
      }

      setServices(filtered);
      const ds: "vehicle" | "admin" = usedVehicleEndpoint ? "vehicle" : "admin";
      setDataSource(ds);
      if (usedVehicleEndpoint) {
        setPagination(null);
      }
    } catch (error) {
      console.error("Failed to load vehicle services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [
    currentPage,
    searchQuery,
    categoryFilter,
    statusFilter,
    vehicleTypeFilter,
    selectedBrand,
    selectedModel,
    selectedFuel,
  ]);

  // If navigated with state.openCreate -> prompt/create a simple service
  useEffect(() => {
    const state: any = (location && (location as any).state) || {};
    if (state.openCreate) {
      // simple prompt flow: ask for title and create minimal service
      const title = window.prompt("Enter service title");
      if (title && title.trim().length > 0) {
        (async () => {
          try {
            await servicesApi.createService({
              title: title.trim(),
              description: "Auto-created service. Please edit details.",
              price: 0,
              durationMinutes: 60,
              category: "General Service",
              status: "active",
              type: "car",
            });
            await loadServices();
          } catch (err) {
            console.error("Failed to create service from quick action:", err);
            // Let the user know via alert for now
            alert("Failed to create service. See console for details.");
          } finally {
            // clear navigation state
            navigate(location.pathname, { replace: true, state: {} });
          }
        })();
      } else {
        // clear state even if canceled
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // availableCategoriesState is populated from loadServices() (unfiltered normalized data).
  const availableCategories =
    availableCategoriesState && availableCategoriesState.length > 0
      ? availableCategoriesState
      : allowedCategories;

  // Load brands on mount for vehicle-services
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/vehicle-services/brands");
        const brands = (res.data as any)?.brands || [];
        setBrands(brands);
      } catch (err) {
        console.error("Failed to load vehicle brands", err);
      }
    })();
  }, []);

  // When brand is selected, load models
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setSelectedModel("");
      return;
    }

    (async () => {
      try {
        const res = await api.get(
          `/vehicle-services/models/${encodeURIComponent(selectedBrand)}`
        );
        const modelsRes = (res.data as any)?.models || [];
        setModels(modelsRes);
      } catch (err) {
        console.error("Failed to load models for brand", selectedBrand, err);
        setModels([]);
      }
    })();
  }, [selectedBrand]);

  // When model is selected, load fuel types
  useEffect(() => {
    if (!selectedBrand || !selectedModel) {
      setFuelTypes([]);
      setSelectedFuel("");
      return;
    }

    (async () => {
      try {
        const res = await api.get(
          `/vehicle-services/fuel-types/${encodeURIComponent(selectedBrand)}/${encodeURIComponent(selectedModel)}`
        );
        const fuels = (res.data as any)?.fuelTypes || [];
        setFuelTypes(fuels);
      } catch (err) {
        console.error("Failed to load fuel types", err);
        setFuelTypes([]);
      }
    })();
  }, [selectedBrand, selectedModel]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadServices();
  };

  const handleBulkAction = async (action: string) => {
    if (selectedServices.length === 0) return;

    try {
      const updateData: any = {};

      switch (action) {
        case "activate":
          updateData.status = "active";
          break;
        case "deactivate":
          updateData.status = "inactive";
          break;
        case "feature":
          updateData.featured = true;
          break;
        case "unfeature":
          updateData.featured = false;
          break;
        case "delete":
          // Handle bulk delete
          for (const serviceId of selectedServices) {
            await servicesApi.deleteService(serviceId);
          }
          break;
      }

      if (action !== "delete") {
        await servicesApi.bulkUpdateServices(selectedServices, updateData);
      }

      await loadServices();
      setSelectedServices([]);
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    }
  };

  const handleServiceAction = async (serviceId: string, action: string) => {
    try {
      // If current list comes from vehicle-services, route actions to override endpoint
      if (dataSource === "vehicle") {
        const svc = services.find((s) => s._id === serviceId);
        if (!svc) return;
        const serviceName = (svc as any).raw?.serviceName || svc.title;
        const commonPayload = {
          brand: selectedBrand,
          model: selectedModel,
          fuel: selectedFuel,
          serviceName,
        } as any;

        switch (action) {
          case "toggle-featured": {
            const next = !svc.featured;
            await api.authPut("/vehicle-services/override/price", {
              ...commonPayload,
              featured: next,
            });
            setServices((prev) =>
              prev.map((s) =>
                s._id === svc._id ? { ...s, featured: next } : s
              )
            );
            return;
          }
          case "toggle-status": {
            const next = svc.status === "active" ? "inactive" : "active";
            await api.authPut("/vehicle-services/override/price", {
              ...commonPayload,
              status: next,
            });
            setServices((prev) =>
              prev.map((s) => (s._id === svc._id ? { ...s, status: next } : s))
            );
            return;
          }
          case "delete": {
            if (
              !window.confirm(
                "Delete this service from this vehicle selection?"
              )
            )
              return;
            await api.authPut("/vehicle-services/override/price", {
              ...commonPayload,
              deleted: true,
            });
            setServices((prev) => prev.filter((s) => s._id !== svc._id));
            return;
          }
          case "edit": {
            // Prompt for editable fields besides price (which is inline)
            const desc = window.prompt(
              "Update description",
              svc.description || ""
            );
            const durStr = window.prompt(
              "Update duration in minutes",
              String(svc.durationMinutes || 60)
            );
            const cat = window.prompt("Update category", svc.category || "");
            const durationMinutes = durStr ? parseInt(durStr, 10) : undefined;
            await api.authPut("/vehicle-services/override/price", {
              ...commonPayload,
              ...(desc !== null ? { description: desc } : {}),
              ...(durationMinutes ? { durationMinutes } : {}),
              ...(cat !== null ? { category: cat } : {}),
            });
            setServices((prev) =>
              prev.map((s) =>
                s._id === svc._id
                  ? {
                      ...s,
                      description: desc ?? s.description,
                      durationMinutes: durationMinutes || s.durationMinutes,
                      category: cat ?? s.category,
                    }
                  : s
              )
            );
            return;
          }
          default:
            break;
        }
      }

      // Default admin-managed services flow
      switch (action) {
        case "toggle-status":
          const service = services.find((s) => s._id === serviceId);
          if (service) {
            const newStatus =
              service.status === "active" ? "inactive" : "active";
            await servicesApi.toggleServiceStatus(serviceId, newStatus);
            await loadServices();
          }
          break;
        case "toggle-featured":
          const featuredService = services.find((s) => s._id === serviceId);
          if (featuredService) {
            await servicesApi.bulkUpdateServices([serviceId], {
              featured: !featuredService.featured,
            });
            await loadServices();
          }
          break;
        case "delete":
          if (window.confirm("Are you sure you want to delete this service?")) {
            await servicesApi.deleteService(serviceId);
            await loadServices();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Service ${action} failed:`, error);
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

    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          config.color
        )}
      >
        {config.label}
      </span>
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => loadServices()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          {dataSource && (
            <span className="hidden md:inline-flex items-center px-3 py-2 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
              Source:{" "}
              {dataSource === "vehicle" ? "Vehicle services" : "Admin services"}
            </span>
          )}
          {hasPermission("manage_services") && (
            <button
              onClick={async () => {
                const title = window.prompt("Enter service title");
                if (!title || !title.trim()) return;
                try {
                  await servicesApi.createService({
                    title: title.trim(),
                    description: "",
                    price: 0,
                    durationMinutes: 60,
                    category: "General Service",
                    status: "active",
                    type: "car",
                  });
                  await loadServices();
                  alert("Service created");
                } catch (err) {
                  console.error("Failed to create service:", err);
                  alert("Failed to create service");
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Vehicles</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!models || models.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">All Models</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel
              </label>
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                disabled={!fuelTypes || fuelTypes.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">All Fuel Types</option>
                {fuelTypes.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedServices.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedServices.length} service(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction("activate")}
                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction("deactivate")}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex items-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              Loading services...
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No services found
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Image removed per request */}

                {/* Service Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {service.title}
                    </h3>
                    <div className="flex items-center space-x-1 ml-2">
                      {service.popular && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={50}
                          value={editedPrices[service._id] ?? service.price}
                          onChange={(e) =>
                            setEditedPrices((prev) => ({
                              ...prev,
                              [service._id]: e.target.value,
                            }))
                          }
                          className="w-28 px-2 py-1 border border-gray-300 rounded"
                        />
                        <button
                          onClick={async () => {
                            const input = editedPrices[service._id];
                            const newPrice = Number(input ?? service.price);
                            if (Number.isNaN(newPrice) || newPrice < 0) {
                              alert("Please enter a valid price");
                              return;
                            }
                            try {
                              // If vehicle selection is active, use vehicle-services override endpoint
                              if (
                                selectedBrand &&
                                selectedModel &&
                                selectedFuel
                              ) {
                                const serviceName =
                                  (service as any).raw?.serviceName ||
                                  service.title;
                                await api.authPut(
                                  "/vehicle-services/override/price",
                                  {
                                    brand: selectedBrand,
                                    model: selectedModel,
                                    fuel: selectedFuel,
                                    serviceName,
                                    price: newPrice,
                                  }
                                );
                              } else {
                                // For admin services, update the service directly
                                // Check if this is an admin service (has _id that doesn't start with 'vs_')
                                if (
                                  service._id &&
                                  !service._id.startsWith("vs_")
                                ) {
                                  await servicesApi.updateService(service._id, {
                                    price: newPrice,
                                  });
                                } else {
                                  // For vehicle services without selection, we can't update
                                  alert(
                                    "Cannot update price for vehicle services without vehicle selection"
                                  );
                                  return;
                                }
                              }
                              // Reload to ensure accurate state
                              await loadServices();
                              setEditedPrices((prev) => ({
                                ...prev,
                                [service._id]: "",
                              }));
                              alert("Price updated successfully");
                            } catch (err) {
                              console.error("Failed to update price", err);
                              alert(
                                "Failed to update price. Check console / network tab."
                              );
                            }
                          }}
                          className="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(service.durationMinutes)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {service.category}
                    </span>
                    {getStatusBadge(service.status)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      {hasPermission("manage_services") && (
                        <>
                          <button
                            onClick={() =>
                              handleServiceAction(service._id, "edit")
                            }
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit service"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleServiceAction(service._id, "toggle-status")
                            }
                            className={cn(
                              "hover:text-gray-900",
                              service.status === "active"
                                ? "text-red-600"
                                : "text-green-600"
                            )}
                            title={
                              service.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            {service.status === "active" ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleServiceAction(service._id, "delete")
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Delete service"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices([
                            ...selectedServices,
                            service._id,
                          ]);
                        } else {
                          setSelectedServices(
                            selectedServices.filter((id) => id !== service._id)
                          );
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.totalItems}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
                      page === pagination.currentPage
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
