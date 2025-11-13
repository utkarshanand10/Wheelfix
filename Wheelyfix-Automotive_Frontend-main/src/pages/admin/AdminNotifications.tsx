import React, { useEffect, useMemo, useState } from "react";
import { settingsApi, analyticsApi } from "@/api/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Activity, Bell, ShoppingCart, CreditCard, Users, Wrench } from "lucide-react";

export const AdminNotifications: React.FC = () => {
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsApi.getSettings();
      setSettings(res.data?.data || res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Failed to load settings"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLogsLoading(true);
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await analyticsApi.getActivityLogs({
        page: 1,
        limit: 100,
        startDate: since,
      });
      const data = res.data?.data || res.data || {};
      const list = data.logs || data.items || [];
      setLogs(list);
      // On visit, treat items as read (clear badge in topbar immediately)
      setUnreadIds(new Set());
      window.dispatchEvent(
        new CustomEvent("admin:notifications:update", { detail: { unread: 0 } })
      );
    } catch (e) {
      // graceful fallback
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadLogs();
  }, []);

  const togglePush = (key: string) => {
    setSettings((prev: any) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        push: {
          ...prev.notifications.push,
          [key]: !prev.notifications.push?.[key],
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      await settingsApi.updateSettings({
        notifications: settings.notifications,
      });
      // reload
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  const markAllAsRead = () => {
    setUnreadIds(new Set());
    window.dispatchEvent(
      new CustomEvent("admin:notifications:update", { detail: { unread: 0 } })
    );
  };

  const markOneAsRead = (id: string) => {
    setUnreadIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("admin:notifications:update", {
          detail: { unread: unreadIds.size },
        })
      );
    }, 0);
  };

  const filteredLogs = useMemo(() => {
    let list = logs;
    if (resourceFilter !== "all") {
      list = list.filter(
        (l: any) => String(l.resource || "").toLowerCase() === resourceFilter
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((l: any) =>
        `${l.action} ${l.resource} ${l.entityTitle || ""} ${l.actorEmail || ""}`
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [logs, search, resourceFilter]);

  const getIcon = (resource?: string) => {
    const r = String(resource || "").toUpperCase();
    if (r === "ORDER") return <ShoppingCart className="h-4 w-4" />;
    if (r === "PAYMENT") return <CreditCard className="h-4 w-4" />;
    if (r === "USER") return <Users className="h-4 w-4" />;
    if (r === "SERVICE") return <Wrench className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select
            value={resourceFilter}
            onValueChange={(v) => setResourceFilter(v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="order">Orders</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="service">Services</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadIds.size === 0}>
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Notification Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Recent Activity
            {unreadIds.size > 0 && (
              <Badge className="bg-red-100 text-red-700">{unreadIds.size} new</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="py-8 text-center text-gray-500">Loading activity…</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No notifications</div>
          ) : (
            <div className="divide-y">
              {filteredLogs.map((n: any) => {
                const unread = unreadIds.has(n._id);
                return (
                  <div key={n._id} className="flex items-start gap-3 py-3">
                    <div
                      className={
                        "flex h-8 w-8 items-center justify-center rounded-full border " +
                        (unread ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50")
                      }
                    >
                      {getIcon(n.resource)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {n.action} {String(n.resource || "").toLowerCase()}
                        </span>
                        {n.entityTitle && (
                          <Badge className="bg-gray-100 text-gray-700">{n.entityTitle}</Badge>
                        )}
                        {unread && (
                          <Badge className="bg-blue-100 text-blue-700">New</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {n.actorEmail || n.actorId?.email || "System"} •{" "}
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {unread && (
                      <Button size="sm" variant="ghost" onClick={() => markOneAsRead(n._id)}>
                        Mark read
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading preferences…</div>}
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {settings && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Push Notifications</h3>
                <div className="mt-2 space-y-2">
                  {Object.keys(settings.notifications?.push || {}).map((key) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!!settings.notifications?.push?.[key]}
                        onChange={() => togglePush(key)}
                      />
                      <span className="capitalize">{key.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Notification Preferences"}
                </Button>
                <Button variant="outline" onClick={() => { load(); loadLogs(); }}>
                  Reload
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
