import React, { useState, useEffect, useRef } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

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
  // Vehicle service specific fields
  serviceName?: string;
  originalPrice?: number;
  vehicleInfo?: {
    brand: string;
    model: string;
    fuel: string;
  };
  // Additional fields from raw data
  name?: string;
  raw?: any;
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
  const importInputRef = useRef<HTMLInputElement | null>(null);
  // Create dialog state & payload
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createPayload, setCreatePayload] = useState<any>({
    title: "",
    description: "",
    priceRupees: "",
    category: "General Service",
    status: "active",
    visible: true,
    type: "car",
    applyToVehicle: false,
    vehicle: { brand: "", model: "", fuel: "" },
  });

  // Quick edit dialog for vehicle-specific service metadata (replace window.prompt)
  const [showQuickEditDialog, setShowQuickEditDialog] = useState(false);
  const [quickEditPayload, setQuickEditPayload] = useState<{
    serviceId?: string;
    serviceName?: string;
    description?: string;
    category?: string;
  }>({});

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

      // PRIORITY: When brand/model/fuel filters are selected, use vehicle-services endpoint
      // This ensures admin sees the same services and prices as the client panel
      let servicesData: any[] = [];
      let usedVehicleEndpoint = false;

      if (selectedBrand && selectedModel && selectedFuel) {
        usedVehicleEndpoint = true;
        const postBody = {
          brand: selectedBrand,
          model: selectedModel,
          fuel: selectedFuel,
        };

        try {
          const response = await api.post("/vehicle-services", postBody);
          const vData = response.data;
          servicesData = extractArray(vData);

          // Vehicle-services endpoint applies pricing overrides automatically
          // If nothing found, fall back to admin services so the page remains usable
          if (!servicesData || servicesData.length === 0) {
            console.warn(
              `No vehicle services found for ${selectedBrand} ${selectedModel} ${selectedFuel}. Falling back to admin services listing.`
            );
            try {
              usedVehicleEndpoint = false;
              const params: any = {
                search: searchQuery || undefined,
                // Only send category to admin API if it's NOT a vehicle-only category
                category:
                  categoryFilter &&
                  !allowedCategories
                    .map((c) => c.toLowerCase())
                    .includes(String(categoryFilter).toLowerCase())
                    ? categoryFilter
                    : undefined,
                status: statusFilter || undefined,
                type: vehicleTypeFilter || undefined,
                page: currentPage || undefined,
                limit: 50,
              };
              const res = await servicesApi.getServices(params);
              const aData = res.data;
              servicesData = extractArray(aData);
              const pag =
                res.data?.pagination || res.data?.data?.pagination || null;
              if (pag) setPagination(pag);
            } catch (fallbackErr) {
              console.error(
                "Admin services fallback after empty vehicle-services failed:",
                fallbackErr
              );
              servicesData = [];
            }
          }
        } catch (err) {
          console.error("Failed to fetch vehicle services:", err);
          // Fall back to admin services when vehicle endpoint errors
          try {
            usedVehicleEndpoint = false;
            const params: any = {
              search: searchQuery || undefined,
              category:
                categoryFilter &&
                !allowedCategories
                  .map((c) => c.toLowerCase())
                  .includes(String(categoryFilter).toLowerCase())
                  ? categoryFilter
                  : undefined,
              status: statusFilter || undefined,
              type: vehicleTypeFilter || undefined,
              page: currentPage || undefined,
              limit: 50,
            };
            const res = await servicesApi.getServices(params);
            const aData = res.data;
            servicesData = extractArray(aData);
            const pag =
              res.data?.pagination || res.data?.data?.pagination || null;
            if (pag) setPagination(pag);
          } catch (fallbackErr) {
            console.error(
              "Admin services fallback after vehicle-services error failed:",
              fallbackErr
            );
            servicesData = [];
          }
        }
      } else if (selectedBrand && selectedModel && !selectedFuel) {
        // Brand & model selected but no fuel — aggregate services across all fuels
        // so the admin can still filter by brand+model without choosing fuel.
        try {
          usedVehicleEndpoint = true;
          const fuelsRes = await api.get(
            `/vehicle-services/fuel-types/${encodeURIComponent(selectedBrand)}/${encodeURIComponent(selectedModel)}`
          );
          const fuels = ((fuelsRes.data as any)?.fuelTypes || []) as string[];
          const aggregated: any[] = [];
          for (const f of fuels) {
            try {
              const resp = await api.post("/vehicle-services", {
                brand: selectedBrand,
                model: selectedModel,
                fuel: f,
              });
              const arr = extractArray(resp.data);
              // Tag each entry with its fuel for context if needed later
              arr.forEach((s: any) =>
                aggregated.push({ ...s, fuelFromAgg: f })
              );
            } catch (e) {
              // continue other fuels
            }
          }
          servicesData = aggregated;
        } catch (e) {
          console.error("Failed to aggregate vehicle services across fuels", e);
          usedVehicleEndpoint = false;
          servicesData = [];
        }
      } else {
        // Fallback to admin services endpoint so filters work without vehicle selection
        try {
          const params: any = {
            // Backend expects 'search' not 'q'
            search: searchQuery || undefined,
            // For admin-managed services, send the selected category directly.
            // Vehicle-specific categories are not queried here because this branch is only used
            // when a vehicle selection is NOT active.
            category:
              categoryFilter &&
              !allowedCategories
                .map((c) => c.toLowerCase())
                .includes(String(categoryFilter).toLowerCase())
                ? categoryFilter
                : undefined,
            status: statusFilter || undefined,
            // Backend expects 'type' (car|bike), not 'vehicleType'
            type: vehicleTypeFilter || undefined,
            page: currentPage || undefined,
            limit: 50,
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
      // For vehicle services, preserve serviceName which is needed for price updates
      const normalized: any[] = (servicesData as any[]).map(
        (s: any, idx: number) => {
          // Vehicle services use serviceName, admin services use title/name
          const serviceName = s.serviceName || s.title || s.name || "";
          const serviceId =
            s._id ||
            s.id ||
            `vs_${selectedBrand}_${selectedModel}_${selectedFuel}_${idx}`;

          return {
            // preserve origin fields, provide UI-friendly names
            _id: serviceId,
            title: s.title || s.serviceName || s.name || "",
            // Preserve serviceName for vehicle services (needed for price override API)
            serviceName: serviceName,
            description: s.description || s.desc || "",
            // Price handling: vehicle-services endpoint now returns prices in RUPEES
            // Both JSON prices and override prices are normalized to rupees
            // For admin services, prices are in paise (divide by 100)
            price: usedVehicleEndpoint
              ? typeof s.price === "number"
                ? s.price
                : Number(s.price) || 0 // Already in rupees
              : (typeof s.price === "number" ? s.price : Number(s.price) || 0) /
                100, // Convert paise to rupees
            // Also preserve originalPrice if available (for reference)
            originalPrice:
              s.originalPrice ||
              (typeof s.price === "number" ? s.price : Number(s.price) || 0),
            durationMinutes:
              s.durationMinutes || s.estimatedTime || s.duration || 60,
            category: s.category || s.type || "General Service",
            status: s.status || "active",
            featured: !!s.featured,
            popular: !!s.popular,
            primaryImage: s.primaryImage || s.image || null,
            // Store raw data for reference
            raw: s,
            // Store vehicle info for price updates
            vehicleInfo: usedVehicleEndpoint
              ? {
                  brand: selectedBrand,
                  model: selectedModel,
                  fuel: selectedFuel,
                }
              : null,
          };
        }
      );

      // Build available categories based on data source:
      // - For vehicle-specific view: restrict to known vehicle categories (intersection)
      // - For admin-managed view: use whatever categories are present in the data
      try {
        const present = Array.from(
          new Set(
            normalized
              .map((s) => String(s.category || "").trim())
              .filter(Boolean)
          )
        );
        if (usedVehicleEndpoint) {
          const intersection = allowedCategories.filter((c) =>
            present.map((p) => p.toLowerCase()).includes(c.toLowerCase())
          );
          setAvailableCategoriesState(
            intersection.length > 0 ? intersection : allowedCategories
          );
        } else {
          setAvailableCategoriesState(present);
        }
      } catch (e) {
        setAvailableCategoriesState(
          usedVehicleEndpoint ? allowedCategories : []
        );
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

  // If navigated with state.openCreate -> open the Create dialog (safer than prompt)
  useEffect(() => {
    const state: any = (location && (location as any).state) || {};
    if (state.openCreate) {
      setCreatePayload((p: any) => ({
        ...p,
        title: state.title || "",
        description: state.description || p.description,
      }));
      setShowCreateDialog(true);
      // clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
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

  // -------- Bulk Export / Import (Admin services only) --------
  const fetchAllAdminServices = async (): Promise<any[]> => {
    const all: any[] = [];
    try {
      // Try to iterate pages until exhausted
      let page = 1;
      // Set a safe upper bound to avoid infinite loops
      const MAX_PAGES = 50;
      while (page <= MAX_PAGES) {
        const res = await servicesApi.getServices({ page });
        const data = res.data;
        const list =
          (Array.isArray(data?.services) && data.services) ||
          (Array.isArray(data?.data?.services) && data.data.services) ||
          (Array.isArray(data) && data) ||
          [];
        if (list.length === 0) break;
        all.push(...list);
        const pag = data?.pagination ||
          data?.data?.pagination || { hasNextPage: false };
        if (!pag?.hasNextPage) break;
        page += 1;
      }
    } catch (err) {
      console.error("Failed to fetch all services for export", err);
    }
    return all;
  };

  const toCsv = (rows: any[]): string => {
    const headers = [
      "id",
      "title",
      "description",
      "pricePaise",
      "priceRupees",
      "category",
      "status",
      "visible",
      "type",
    ];
    const escape = (v: any) => {
      const s = v === undefined || v === null ? "" : String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r._id || r.id || "",
          r.title || r.name || "",
          r.description || "",
          typeof r.price === "number" ? r.price : "",
          typeof r.price === "number"
            ? Math.round((r.price as number) / 100)
            : "",
          r.category || "",
          r.status || "",
          typeof r.visible === "boolean" ? r.visible : "",
          r.type || "",
        ]
          .map(escape)
          .join(",")
      ),
    ];
    return lines.join("\n");
  };

  const downloadBlob = (
    content: string,
    filename: string,
    type = "text/csv;charset=utf-8;"
  ) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = async () => {
    try {
      const data = await fetchAllAdminServices();
      if (!data.length) {
        alert("No services to export.");
        return;
      }
      const csv = toCsv(data);
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      downloadBlob(csv, `services-export-${ts}.csv`);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export services.");
    }
  };

  const parseCsv = (text: string): any[] => {
    // Auto-detect delimiter: comma, semicolon, or tab
    const lines = text.split(/\r?\n/).filter((l) => l !== "");
    if (lines.length === 0) return [];
    const sniff = lines[0];
    const counts = (
      [
        [",", (sniff.match(/,/g) || []).length] as [string, number],
        [";", (sniff.match(/;/g) || []).length] as [string, number],
        ["\t", (sniff.match(/\t/g) || []).length] as [string, number],
        ["|", (sniff.match(/\|/g) || []).length] as [string, number],
      ] as [string, number][]
    ).sort((a, b) => b[1] - a[1]);
    const delim = counts[0][1] > 0 ? counts[0][0] : ",";

    const splitLine = (line: string): string[] => {
      const cells: string[] = [];
      let cur = "";
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQuote = !inQuote;
        } else if (line.startsWith(delim, i) && !inQuote) {
          cells.push(cur);
          cur = "";
          i += delim.length - 1;
        } else {
          cur += ch;
        }
      }
      cells.push(cur);
      return cells;
    };

    const headersRaw = splitLine(lines[0]).map((h) =>
      h.trim().replace(/^"|"$/g, "")
    );
    const headers =
      headersRaw.length > 1
        ? headersRaw
        : // If only one header detected, try tab as fallback
          splitLine(lines[0].replace(/,/g, "\t")).map((h) =>
            h.trim().replace(/^"|"$/g, "")
          );

    const rows: any[] = [];
    for (let li = 1; li < lines.length; li++) {
      const cells = splitLine(lines[li]);
      const row: any = {};
      headers.forEach((h, idx) => (row[h] = (cells[idx] || "").trim()));
      // Drop rows that are entirely empty
      const nonEmpty = Object.values(row).some(
        (v) => String(v || "").trim() !== ""
      );
      if (nonEmpty) rows.push(row);
    }
    return rows;
  };

  // Helpers for vehicle-specific bulk import
  const normalizeHeader = (h: string) =>
    String(h || "")
      .toLowerCase()
      .replace(/[\s_/]+/g, "")
      .replace(/[().-]/g, "");

  const parseMoneyToRupees = (v: any): number | undefined => {
    if (v === undefined || v === null) return undefined;
    const s = String(v);
    if (!s) return undefined;
    const digits = s.replace(/[^0-9.]/g, "");
    if (!digits) return undefined;
    const n = Number(digits);
    return Number.isFinite(n) ? n : undefined;
  };

  const rowHasVehicleColumns = (row: any): boolean => {
    const keys = Object.keys(row || {}).map(normalizeHeader);
    const hasBrand =
      keys.includes("carmanufecturer") ||
      keys.includes("manufacturer") ||
      keys.includes("brand");
    const hasModel = keys.includes("carmodel") || keys.includes("model");
    const hasFuelCols =
      keys.includes("petrolcng") ||
      keys.includes("diesel") ||
      keys.includes("electric");
    const hasPriceCols =
      keys.includes("baseprice") ||
      keys.includes("discountprice") ||
      keys.includes("price");
    return hasBrand && hasModel && hasFuelCols && hasPriceCols;
  };

  const getCell = (row: any, variants: string[]): any => {
    for (const v of variants) {
      const hit = Object.keys(row).find(
        (k) => normalizeHeader(k) === normalizeHeader(v)
      );
      if (hit) return row[hit];
    }
    return undefined;
  };

  // Import rows as vehicle-specific overrides.
  // For each row we may create up to two overrides (Petrol/CNG and Diesel) for Standard/Comprehensive buckets.
  const importVehicleOverridesFromRows = async (rows: any[]) => {
    let created = 0;
    for (const raw of rows) {
      if (!rowHasVehicleColumns(raw)) continue;

      const brand = String(
        getCell(raw, ["CAR MANUFECTURER", "Manufacturer", "Brand"]) || ""
      )
        .trim()
        .toUpperCase();
      const model = String(getCell(raw, ["CAR MODEL", "Model"]) || "").trim();

      // Service names derived from frequency columns
      const stdCol = getCell(raw, [
        "STANDARD SERVICE",
        "EVERY 10000 KMS / 6 MONTHS",
      ]);
      const compCol = getCell(raw, [
        "COMPREHENSIVE SERVICE",
        "EVERY 20000 KMS / 1 YEAR",
      ]);

      // Prices
      const basePrice = parseMoneyToRupees(
        getCell(raw, ["BASE PRICE", "Price"])
      );
      const discountPrice = parseMoneyToRupees(
        getCell(raw, ["DISCOUNT PRICE", "Discount"])
      );
      const effectivePrice = discountPrice ?? basePrice;
      // If no price on row, skip
      if (effectivePrice === undefined) continue;
      const pricePaise = Math.round((effectivePrice || 0) * 100);

      // Fuels markers: value present means row pertains to that fuel
      const petrolMarker = getCell(raw, [
        "PETROL /CNG",
        "PETROL/CNG",
        "PETROL",
        "CNG",
      ]);
      const dieselMarker = getCell(raw, ["DIESEL"]);
      const fuels: string[] = [];
      if (String(petrolMarker ?? "").length > 0) fuels.push("Petrol /CNG");
      if (String(dieselMarker ?? "").length > 0) fuels.push("DIESEL");
      // Fallback: if neither explicitly present, attempt both
      if (fuels.length === 0) fuels.push("Petrol /CNG", "DIESEL");

      // Build service names array present on the row
      const serviceNames: string[] = [];
      if (String(stdCol || "").length > 0)
        serviceNames.push("Standard Service");
      if (String(compCol || "").length > 0)
        serviceNames.push("Comprehensive Service");
      // Fallback to generic when not specified
      if (serviceNames.length === 0) serviceNames.push("Service On Demand");

      for (const fuelRaw of fuels) {
        const fuel = /diesel/i.test(fuelRaw)
          ? "DIESEL"
          : /electric/i.test(fuelRaw)
            ? "ELECTRIC"
            : "PETROL /CNG";
        for (const serviceName of serviceNames) {
          try {
            await servicesApi.updateVehicleServicePrice({
              brand,
              model,
              fuel,
              serviceName,
              price: pricePaise,
            });
            created += 1;
          } catch (e) {
            console.error("Vehicle override upsert failed", {
              brand,
              model,
              fuel,
              serviceName,
              pricePaise,
              raw,
            });
          }
        }
      }
    }
    return created;
  };

  const upsertServices = async (items: any[]) => {
    // Strategy:
    // - If 'id' present => update
    // - Else if 'title' matches existing service title (case-insensitive) => update first match
    // - Else create
    const existing = await fetchAllAdminServices();
    const titleToService: Record<string, any> = {};
    existing.forEach((s: any) => {
      const key = String(s.title || s.name || "")
        .toLowerCase()
        .trim();
      if (key) titleToService[key] = s;
    });

    let created = 0;
    let updated = 0;

    for (const raw of items) {
      try {
        // Skip obvious non-data or section header rows
        const cellsCount = Object.keys(raw || {}).length;
        if (
          cellsCount <= 1 &&
          !rowHasVehicleColumns(raw) &&
          !String(raw?.title || raw?.name || "").trim()
        ) {
          continue;
        }
        const id = raw.id || raw._id;
        const title = (raw.title || raw.name || "").trim();
        const description = raw.description || "";
        // Prefer explicit pricePaise, otherwise convert priceRupees
        const pricePaise =
          raw.pricePaise !== undefined && raw.pricePaise !== ""
            ? Number(raw.pricePaise)
            : raw.priceInRupees !== undefined && raw.priceInRupees !== ""
              ? Math.round(Number(raw.priceInRupees) * 100)
              : undefined;
        const payload: any = {
          ...(title ? { title } : {}),
          ...(description ? { description } : {}),
          ...(typeof pricePaise === "number" && !Number.isNaN(pricePaise)
            ? { price: pricePaise }
            : {}),
          ...(raw.category ? { category: raw.category } : {}),
          ...(raw.status ? { status: raw.status } : {}),
          ...(raw.visible !== undefined
            ? {
                visible: String(raw.visible) === "true" || raw.visible === true,
              }
            : {}),
          ...(raw.type ? { type: raw.type } : {}),
        };

        // Do not call API if nothing meaningful to upsert
        if (Object.keys(payload).length === 0) {
          continue;
        }
        // Prevent creating empty services: require at least a title on create
        if (!id && !title) {
          continue;
        }

        if (id) {
          await servicesApi.updateService(String(id), payload);
          updated += 1;
        } else if (title && titleToService[title.toLowerCase()]) {
          const svc = titleToService[title.toLowerCase()];
          await servicesApi.updateService(String(svc._id || svc.id), payload);
          updated += 1;
        } else {
          await servicesApi.createService(payload);
          created += 1;
        }
      } catch (e) {
        console.error("Upsert failed for row", raw, e);
      }
    }

    alert(`Import completed. Created: ${created}, Updated: ${updated}`);
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      let items: any[] = [];
      if (file.name.toLowerCase().endsWith(".json")) {
        const parsed = JSON.parse(text);
        items = Array.isArray(parsed) ? parsed : parsed?.services || [];
      } else {
        items = parseCsv(text);
      }
      if (!Array.isArray(items) || items.length === 0) {
        alert("No rows found to import.");
        return;
      }
      // Detect if these rows look like vehicle-specific data
      const isVehicleCsv = items.some((r) => rowHasVehicleColumns(r));

      if (
        !window.confirm(
          isVehicleCsv
            ? `Import ${items.length} vehicle-specific service row(s)? This will create overrides for the selected brand/model/fuel combinations.`
            : `Import ${items.length} service(s)? This will create or update services.`
        )
      ) {
        return;
      }
      if (isVehicleCsv) {
        const created = await importVehicleOverridesFromRows(items);
        alert(`Vehicle overrides import completed. Upserts: ${created}`);
      } else {
        await upsertServices(items);
      }
      await loadServices();
    } catch (err) {
      console.error("Import failed", err);
      alert("Failed to import services. Please check the file format.");
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
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
            // Open the quick-edit dialog (replaces window.prompt)
            setQuickEditPayload({
              serviceId: svc._id,
              serviceName,
              description: svc.description || "",
              category: svc.category || "",
            });
            setShowQuickEditDialog(true);
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

  // Handler to create admin service or vehicle-specific override from dialog
  const handleCreateService = async () => {
    try {
      if (!createPayload.title || !createPayload.title.trim()) {
        alert("Please provide a service title");
        return;
      }

      const paise = Math.round(
        (parseFloat(String(createPayload.priceRupees)) || 0) * 100
      );

      // If admin wants to create a vehicle-specific override
      if (
        createPayload.applyToVehicle &&
        createPayload.vehicle?.brand &&
        createPayload.vehicle?.model &&
        createPayload.vehicle?.fuel
      ) {
        const payload: any = {
          brand: createPayload.vehicle.brand,
          model: createPayload.vehicle.model,
          fuel: createPayload.vehicle.fuel,
          serviceName: createPayload.title.trim(),
          price: paise, // paise as vehicle override expects
          description: createPayload.description,
          category: createPayload.category,
          featured: false,
          status: createPayload.status,
          visible: createPayload.visible,
        };

        await api.authPut("/vehicle-services/override/price", payload);

        // If current listing matches the vehicle we updated, reload
        if (
          selectedBrand === createPayload.vehicle.brand &&
          selectedModel === createPayload.vehicle.model &&
          selectedFuel === createPayload.vehicle.fuel
        ) {
          await loadServices();
        }
      } else {
        // Create admin-managed service (prices in paise)
        await servicesApi.createService({
          title: createPayload.title.trim(),
          description: createPayload.description,
          price: paise,
          category: createPayload.category,
          status: createPayload.status,
          visible: createPayload.visible,
          type: createPayload.type,
        });
        // If we were in vehicle-specific view, switch back to admin view so the new service is visible
        if (selectedBrand || selectedModel || selectedFuel) {
          setSelectedBrand("");
          setSelectedModel("");
          setSelectedFuel("");
          setCurrentPage(1);
        }
        await loadServices();
      }

      setShowCreateDialog(false);
    } catch (err) {
      console.error("Failed to create service:", err);
      alert("Failed to create service. See console for details.");
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
          {/* Bulk Export / Import controls (admin services) */}
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            title="Export all admin services to CSV"
          >
            Export
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f);
            }}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800"
            title="Import services from CSV/JSON"
          >
            Import
          </button>
          {dataSource === "vehicle" &&
            selectedBrand &&
            selectedModel &&
            selectedFuel && (
              <span className="hidden md:inline-flex items-center px-3 py-2 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                Vehicle Services: {selectedBrand} {selectedModel} (
                {selectedFuel})
                <span className="ml-2 text-xs text-blue-600">
                  • Price updates apply to this vehicle combination
                </span>
              </span>
            )}
          {dataSource === "admin" && (
            <span className="hidden md:inline-flex items-center px-3 py-2 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
              Admin Services
              {(!selectedBrand || !selectedModel || !selectedFuel) && (
                <span className="ml-2 text-xs text-gray-500">
                  • Select Brand, Model, and Fuel to view vehicle-specific
                  services
                </span>
              )}
            </span>
          )}
          {hasPermission("manage_services") && (
            <>
              <button
                onClick={() => {
                  // open dialog by setting state below
                  setShowCreateDialog(true);
                  // initialize form
                  setCreatePayload({
                    title: "",
                    description: "",
                    priceRupees: "",
                    category: "General Service",
                    status: "active",
                    visible: true,
                    type: "car",
                    applyToVehicle: false,
                    vehicle: {
                      brand: selectedBrand || "",
                      model: selectedModel || "",
                      fuel: selectedFuel || "",
                    },
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </button>

              {/* Create Service Dialog */}
              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                      Create Service
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the details below to add a new service or create a
                      vehicle-specific override.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="svc-title">Title</Label>
                      <Input
                        id="svc-title"
                        value={createPayload.title}
                        onChange={(e) =>
                          setCreatePayload({
                            ...createPayload,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="svc-desc">Description</Label>
                      <Textarea
                        id="svc-desc"
                        value={createPayload.description}
                        onChange={(e) =>
                          setCreatePayload({
                            ...createPayload,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="svc-price">Price (₹)</Label>
                        <Input
                          id="svc-price"
                          type="number"
                          value={createPayload.priceRupees}
                          onChange={(e) =>
                            setCreatePayload({
                              ...createPayload,
                              priceRupees: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={createPayload.category}
                          onChange={(e) =>
                            setCreatePayload({
                              ...createPayload,
                              category: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={createPayload.visible}
                          onCheckedChange={(v) =>
                            setCreatePayload({ ...createPayload, visible: !!v })
                          }
                        />
                        <Label>Visible</Label>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="text-sm font-medium mb-2">
                        Apply to specific vehicle
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label>Brand</Label>
                          <select
                            className="w-full px-3 py-2 border rounded"
                            value={createPayload.vehicle.brand}
                            onChange={async (e) => {
                              const brand = e.target.value;
                              setCreatePayload({
                                ...createPayload,
                                vehicle: {
                                  ...createPayload.vehicle,
                                  brand,
                                  model: "",
                                  fuel: "",
                                },
                              });
                              // fetch models for this brand for the dialog
                              try {
                                const res = await api.get(
                                  `/vehicle-services/models/${encodeURIComponent(brand)}`
                                );
                                const modelsRes =
                                  (res.data as any)?.models || [];
                                setModels(modelsRes);
                              } catch (err) {
                                console.error(
                                  "Failed to load models for brand in dialog",
                                  err
                                );
                                setModels([]);
                              }
                            }}
                          >
                            <option value="">(none)</option>
                            {brands.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Model</Label>
                          <select
                            className="w-full px-3 py-2 border rounded"
                            value={createPayload.vehicle.model}
                            onChange={async (e) => {
                              const model = e.target.value;
                              setCreatePayload({
                                ...createPayload,
                                vehicle: {
                                  ...createPayload.vehicle,
                                  model,
                                  fuel: "",
                                },
                              });
                              try {
                                const res = await api.get(
                                  `/vehicle-services/fuel-types/${encodeURIComponent(createPayload.vehicle.brand)}/${encodeURIComponent(model)}`
                                );
                                const fuels =
                                  (res.data as any)?.fuelTypes || [];
                                setFuelTypes(fuels);
                              } catch (err) {
                                console.error(
                                  "Failed to load fuel types for dialog model",
                                  err
                                );
                                setFuelTypes([]);
                              }
                            }}
                          >
                            <option value="">(none)</option>
                            {models.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Fuel</Label>
                          <select
                            className="w-full px-3 py-2 border rounded"
                            value={createPayload.vehicle.fuel}
                            onChange={(e) =>
                              setCreatePayload({
                                ...createPayload,
                                vehicle: {
                                  ...createPayload.vehicle,
                                  fuel: e.target.value,
                                },
                              })
                            }
                          >
                            <option value="">(none)</option>
                            {fuelTypes.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        Check the box below to create a vehicle-specific
                        override for the selected vehicle.
                      </div>
                      <div className="flex items-center mt-2">
                        <Switch
                          checked={createPayload.applyToVehicle}
                          onCheckedChange={(v) =>
                            setCreatePayload({
                              ...createPayload,
                              applyToVehicle: !!v,
                            })
                          }
                        />
                        <Label className="ml-2">
                          Create vehicle-specific override
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setShowCreateDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateService}
                        className="bg-blue-600 text-white"
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
                {/* Quick Edit Dialog for vehicle-specific metadata (description/category) */}
                <Dialog open={showQuickEditDialog} onOpenChange={setShowQuickEditDialog}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Quick Edit Service</DialogTitle>
                      <DialogDescription>
                        Update service description or category for this vehicle selection.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                        <div className="text-sm text-gray-900">
                          {quickEditPayload.serviceName}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <Textarea
                          value={quickEditPayload.description}
                          onChange={(e) => setQuickEditPayload({ ...quickEditPayload, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <Input
                          value={quickEditPayload.category}
                          onChange={(e) => setQuickEditPayload({ ...quickEditPayload, category: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setShowQuickEditDialog(false)}>Cancel</Button>
                        <Button
                          onClick={async () => {
                            try {
                              const svcId = quickEditPayload.serviceId;
                              if (!svcId) return;
                              const payload: any = {
                                brand: selectedBrand,
                                model: selectedModel,
                                fuel: selectedFuel,
                                serviceName: quickEditPayload.serviceName,
                              };
                              if (quickEditPayload.description !== undefined) payload.description = quickEditPayload.description;
                              if (quickEditPayload.category !== undefined) payload.category = quickEditPayload.category;
                              await api.authPut('/vehicle-services/override/price', payload);
                              setServices((prev) => prev.map((s) => s._id === svcId ? { ...s, description: quickEditPayload.description ?? s.description, category: quickEditPayload.category ?? s.category } : s));
                              setShowQuickEditDialog(false);
                            } catch (err) {
                              console.error('Failed to quick-edit service', err);
                              alert('Failed to update service. See console for details.');
                            }
                          }}
                          className="bg-blue-600 text-white"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
            </>
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
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No services found</p>
            {selectedBrand && selectedModel && selectedFuel ? (
              <p className="text-sm text-gray-400">
                No vehicle services available for {selectedBrand}{" "}
                {selectedModel} ({selectedFuel}).
                <br />
                Services may need to be added to the vehicle services data file.
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                {!selectedBrand || !selectedModel || !selectedFuel
                  ? "Select Brand, Model, and Fuel to view vehicle-specific services, or services may need to be created."
                  : "Try adjusting your filters or create a new service."}
              </p>
            )}
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
                      <span className="text-xs text-gray-500">₹</span>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            step={50}
                            placeholder="Price in ₹"
                            value={
                              editedPrices[service._id] ??
                              (service.price ? service.price.toFixed(0) : "")
                            }
                            onChange={(e) =>
                              setEditedPrices((prev) => ({
                                ...prev,
                                [service._id]: e.target.value,
                              }))
                            }
                            className="w-28 px-2 py-1 border border-gray-300 rounded"
                          />
                        </div>
                        {/* Info text for vehicle services */}
                        {dataSource === "vehicle" && (
                          <span className="text-xs text-blue-600">
                            Price for {selectedBrand} {selectedModel} (
                            {selectedFuel})
                          </span>
                        )}
                        <button
                          onClick={async () => {
                            const input = editedPrices[service._id];
                            // Get current price in rupees
                            // service.price is already in rupees for vehicle services
                            const priceInRupees = input
                              ? Number(input)
                              : service.price
                                ? service.price
                                : 0;

                            if (
                              Number.isNaN(priceInRupees) ||
                              priceInRupees < 0
                            ) {
                              alert("Please enter a valid price");
                              return;
                            }

                            // For vehicle services: PricingRule stores prices in PAISE
                            // Convert rupees to paise (1 rupee = 100 paise)
                            // For admin services: Service model also stores in paise
                            const newPriceInPaise = Math.round(
                              priceInRupees * 100
                            );

                            try {
                              // PRIORITY: When vehicle filters are selected, always use vehicle-services override
                              // This ensures price updates are vehicle-specific and show in client panel
                              if (
                                selectedBrand &&
                                selectedModel &&
                                selectedFuel
                              ) {
                                // Get serviceName from the service data
                                // Vehicle services use serviceName field, which is preserved in normalization
                                const serviceName =
                                  service.serviceName ||
                                  service.raw?.serviceName ||
                                  service.title ||
                                  (service as any).name;

                                if (!serviceName) {
                                  alert(
                                    "Cannot update price: Service name not found"
                                  );
                                  return;
                                }

                                // Update price via vehicle-services override endpoint
                                // This creates/updates a PricingRule that applies to this specific vehicle combination
                                await servicesApi.updateVehicleServicePrice({
                                  brand: selectedBrand,
                                  model: selectedModel,
                                  fuel: selectedFuel,
                                  serviceName: serviceName,
                                  price: newPriceInPaise,
                                });

                                console.log(
                                  `Price updated for ${serviceName} (${selectedBrand} ${selectedModel} ${selectedFuel}): ₹${priceInRupees}`
                                );
                              } else {
                                // For admin services (no vehicle filters), update the service directly in database
                                // Check if this is an admin service (has _id that doesn't start with 'vs_')
                                if (
                                  service._id &&
                                  !service._id.startsWith("vs_")
                                ) {
                                  await servicesApi.updateService(service._id, {
                                    price: newPriceInPaise,
                                  });
                                } else {
                                  // Cannot update vehicle services without vehicle selection
                                  alert(
                                    "Please select Brand, Model, and Fuel to update vehicle-specific service prices."
                                  );
                                  return;
                                }
                              }
                              // Reload to ensure accurate state
                              await loadServices();
                              setEditedPrices((prev) => {
                                const updated = { ...prev };
                                delete updated[service._id];
                                return updated;
                              });
                              alert(
                                `Price updated successfully to ₹${priceInRupees}`
                              );
                            } catch (err: any) {
                              console.error("Failed to update price", err);
                              const errorMessage =
                                err.response?.data?.message ||
                                err.message ||
                                "Failed to update price. Please try again.";

                              if (
                                err.message?.includes("Token expired") ||
                                err.response?.status === 401
                              ) {
                                alert(
                                  "Your session has expired. Please refresh the page and try again."
                                );
                                // Optionally reload the page to trigger re-authentication
                                setTimeout(() => {
                                  window.location.reload();
                                }, 2000);
                              } else {
                                alert(`Error: ${errorMessage}`);
                              }
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
