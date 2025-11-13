import React, { useEffect, useMemo, useState } from "react";
import { analyticsApi } from "@/api/admin";
import axios from "axios";
import { Search } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

type LogItem = any;

export const AdminActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [query, setQuery] = useState("");
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const limit = 50; // show more by default

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Primary: use admin analytics endpoint
      const res = await analyticsApi.getActivityLogs({
        page: p,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const data = res.data?.data;

      // If analytics endpoint returns logs in expected shape
      if (data && Array.isArray(data.logs)) {
        setLogs(data.logs);
        setPages(data?.pagination?.pages || 1);
        setPage(data?.pagination?.current || p);
      } else {
        throw new Error("Analytics data missing");
      }
    } catch (err: any) {
      // Fallback: try audit route
      try {
        const token = localStorage.getItem("admin_access_token");
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const fallbackRes = await axios.get(`${API_BASE_URL}/audit`, {
          headers,
          params: { limit },
        });
        const items = fallbackRes.data?.items || fallbackRes.data || [];
        const normalizedLogs = Array.isArray(items) ? items : [];
        setLogs(normalizedLogs);
        setPages(1);
        setPage(1);
        setError(null);
      } catch (fbErr: any) {
        setError(
          err?.response?.data?.message || err.message || "Failed to load logs"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // client-side search/filter
  const filteredLogs = useMemo(() => {
    if (!query) return logs;
    const q = query.toLowerCase();
    return logs.filter((log: LogItem) => {
      const actor =
        log.adminId?.name ||
        log.adminId?.email ||
        log.metadata?.userEmail ||
        log.metadata?.user?.email ||
        log.targetName ||
        "";
      const action = String(log.action || "");
      const resource = String(log.resource || "");
      const target = String(log.targetName || log.targetId || "");
      return [actor, action, resource, target].some((s) =>
        s.toLowerCase().includes(q)
      );
    });
  }, [logs, query]);

  const toggleDetails = (id: string) => {
    setOpenDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Activity Logs
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Recent administrator and user activity for audit and
            troubleshooting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              aria-label="Search logs"
              placeholder="Search actor, action, resource, target..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-3 py-2 w-72 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
          <div className="text-sm text-slate-700">
            <div className="text-xs text-slate-500">Showing</div>
            <div className="font-medium">
              {filteredLogs.length} of {logs.length}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="overflow-hidden bg-white border rounded-md shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                Actor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                Resource
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                Target
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">
                {" "}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  Loading activity…
                </td>
              </tr>
            )}

            {!loading && filteredLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">
                  <div className="text-slate-700 font-medium mb-1">
                    No activity found
                  </div>
                  <div className="text-sm text-slate-500">
                    Try adjusting your search or perform actions to generate
                    logs.
                  </div>
                </td>
              </tr>
            )}

            {filteredLogs.map((log: LogItem, idx: number) => {
              const id = log._id || `${idx}-${String(log.createdAt || idx)}`;
              const actor =
                log.adminId?.name ||
                log.adminId?.email ||
                log.metadata?.userEmail ||
                log.metadata?.user?.email ||
                log.targetName ||
                "—";
              const action = String(log.action || "").toUpperCase();
              const resource = String(log.resource || "").replace(/_/g, " ");
              const target = String(log.targetName || log.targetId || "—");
              const time = log.createdAt
                ? new Date(log.createdAt).toLocaleString()
                : "—";
              const isLogin = action === "LOGIN";

              return (
                <React.Fragment key={id}>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 align-top text-slate-700 w-48">
                      {time}
                    </td>
                    <td
                      className="px-4 py-3 align-top text-slate-800 font-medium w-56 truncate"
                      title={actor}
                    >
                      {actor}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${isLogin ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"}`}
                      >
                        {action}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 align-top text-slate-700 w-40 truncate"
                      title={resource}
                    >
                      {resource}
                    </td>
                    <td
                      className="px-4 py-3 align-top text-slate-700 truncate"
                      title={target}
                    >
                      {target}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        onClick={() => toggleDetails(id)}
                        className="text-sm text-sky-600 hover:underline"
                        aria-expanded={!!openDetails[id]}
                      >
                        {openDetails[id] ? "Hide details" : "View details"}
                      </button>
                    </td>
                  </tr>

                  {openDetails[id] && (
                    <tr className="bg-slate-50">
                      <td
                        colSpan={6}
                        className="px-6 py-3 text-sm text-slate-700"
                      >
                        <div className="mb-2 text-xs text-slate-500">
                          Metadata
                        </div>
                        <pre className="max-h-48 overflow-auto text-xs bg-white border rounded p-3 text-slate-700">
                          {JSON.stringify(log.metadata || log, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing {Math.min(filteredLogs.length, limit)} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
            disabled={page <= 1}
            onClick={() => fetchLogs(page - 1)}
          >
            Previous
          </button>
          <div className="text-sm">
            Page <span className="font-medium">{page}</span> /{" "}
            <span className="font-medium">{pages}</span>
          </div>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
            disabled={page >= pages}
            onClick={() => fetchLogs(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLogs;
