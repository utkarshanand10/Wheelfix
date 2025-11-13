import React, { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { settingsApi } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Building2,
  CreditCard,
  Mail,
  Globe,
  Shield,
  Bell,
  Settings as SettingsIcon,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Settings {
  company: {
    name: string;
    logo?: { url: string; alt: string };
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
    address: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      pincode?: string;
    };
    socialMedia: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
  };
  payment: {
    razorpay: {
      keyId: string;
      keySecret: string;
      webhookSecret: string;
      mode: "test" | "live";
    };
    currency: string;
    taxRate: number;
    taxType: string;
    minimumOrderAmount: number;
  };
  email: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    from: {
      name: string;
      email: string;
    };
  };
  site: {
    title: string;
    description?: string;
    keywords: string[];
    logo?: { url: string; alt: string };
    favicon?: string;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
    };
  };
  features: {
    userRegistration: boolean;
    emailVerification: boolean;
    twoFactorAuth: boolean;
    guestCheckout: boolean;
    wishlist: boolean;
    reviews: boolean;
    notifications: boolean;
  };
  notifications: {
    email: {
      newOrder: boolean;
      orderUpdate: boolean;
      lowStock: boolean;
      newUser: boolean;
    };
    sms: {
      newOrder: boolean;
      orderUpdate: boolean;
      lowStock: boolean;
    };
    push: {
      newOrder: boolean;
      orderUpdate: boolean;
      promotions: boolean;
    };
  };
}

export const AdminSettings: React.FC = () => {
  const { hasPermission } = useAdmin();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("company");

  // Check permissions
  if (!hasPermission("manage_settings")) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to manage settings.
          </p>
        </div>
      </div>
    );
  }

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getSettings();
      setSettings(response.data.data.settings);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (section: string, data: any) => {
    try {
      setSaving(true);
      await settingsApi.updateSettings({ [section]: data });
      toast.success("Settings saved successfully");
      loadSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCompanyUpdate = () => {
    if (!settings) return;
    handleSave("company", settings.company);
  };

  const handlePaymentUpdate = () => {
    if (!settings) return;
    handleSave("payment", settings.payment);
  };

  const handleEmailUpdate = () => {
    if (!settings) return;
    handleSave("email", settings.email);
  };

  const handleSiteUpdate = () => {
    if (!settings) return;
    handleSave("site", settings.site);
  };

  const handleFeaturesUpdate = () => {
    if (!settings) return;
    handleSave("features", settings.features);
  };

  const handleNotificationsUpdate = () => {
    if (!settings) return;
    handleSave("notifications", settings.notifications);
  };

  const handleMaintenanceToggle = async () => {
    if (!settings) return;

    const newMode = !settings.site.maintenanceMode;
    const message = newMode
      ? prompt("Enter maintenance message:") ||
        "Site is under maintenance. Please check back later."
      : undefined;

    try {
      setSaving(true);
      await settingsApi.toggleMaintenanceMode({
        enabled: newMode,
        message,
      });
      toast.success(`Maintenance mode ${newMode ? "enabled" : "disabled"}`);
      loadSettings();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to toggle maintenance mode"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Settings Not Found
          </h1>
          <p className="text-gray-600">
            Unable to load settings. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your application settings</p>
        </div>
        <div className="flex items-center space-x-2">
          {settings.site.maintenanceMode && (
            <div className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Maintenance Mode Active
              </span>
            </div>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Company</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Payment</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="site" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Site</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center space-x-2">
            <SettingsIcon className="h-4 w-4" />
            <span>Features</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center space-x-2"
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.company.name || ""}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              company: {
                                ...prev.company,
                                name: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.company.email || ""}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              company: {
                                ...prev.company,
                                email: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={settings.company.phone || ""}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              company: {
                                ...prev.company,
                                phone: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    value={settings.company.website || ""}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              company: {
                                ...prev.company,
                                website: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyDescription">Description</Label>
                <Textarea
                  id="companyDescription"
                  value={settings.company.description || ""}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev
                        ? {
                            ...prev,
                            company: {
                              ...prev.company,
                              description: e.target.value,
                            },
                          }
                        : null
                    )
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      value={settings.company.address?.street || ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                company: {
                                  ...prev.company,
                                  address: {
                                    ...prev.company.address,
                                    street: e.target.value,
                                  },
                                },
                              }
                            : null
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={settings.company.address?.city || ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                company: {
                                  ...prev.company,
                                  address: {
                                    ...prev.company.address,
                                    city: e.target.value,
                                  },
                                },
                              }
                            : null
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={settings.company.address?.state || ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                company: {
                                  ...prev.company,
                                  address: {
                                    ...prev.company.address,
                                    state: e.target.value,
                                  },
                                },
                              }
                            : null
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={settings.company.address?.pincode || ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                company: {
                                  ...prev.company,
                                  address: {
                                    ...prev.company.address,
                                    pincode: e.target.value,
                                  },
                                },
                              }
                            : null
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleCompanyUpdate} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Company Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Razorpay Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeyId">Key ID</Label>
                    <Input
                      id="razorpayKeyId"
                      type="password"
                      value={settings.payment.razorpay.keyId || ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                payment: {
                                  ...prev.payment,
                                  razorpay: {
                                    ...prev.payment.razorpay,
                                    keyId: e.target.value,
                                  },
                                },
                              }
                            : null
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeySecret">Key Secret</Label>
                    <Input
                      id="razorpayKeySecret"
                      type="password"
                      value={settings.payment.razorpay.keySecret || ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                payment: {
                                  ...prev.payment,
                                  razorpay: {
                                    ...prev.payment.razorpay,
                                    keySecret: e.target.value,
                                  },
                                },
                              }
                            : null
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="razorpayMode">Mode</Label>
                    <select
                      id="razorpayMode"
                      value={settings.payment.razorpay.mode || "test"}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                payment: {
                                  ...prev.payment,
                                  razorpay: {
                                    ...prev.payment.razorpay,
                                    mode: e.target.value as "test" | "live",
                                  },
                                },
                              }
                            : null
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="test">Test</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  General Payment Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      value={settings.payment.currency || "INR"}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                payment: {
                                  ...prev.payment,
                                  currency: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={settings.payment.taxRate ?? ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                payment: {
                                  ...prev.payment,
                                  taxRate: Number(e.target.value),
                                },
                              }
                            : null
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxType">Tax Type</Label>
                    <select
                      id="taxType"
                      value={settings.payment.taxType || "GST"}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                payment: {
                                  ...prev.payment,
                                  taxType: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="GST">GST</option>
                      <option value="VAT">VAT</option>
                      <option value="Sales Tax">Sales Tax</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumOrderAmount">
                      Minimum Order Amount
                    </Label>
                    <Input
                      id="minimumOrderAmount"
                      type="number"
                      min="0"
                      value={settings.payment.minimumOrderAmount ?? ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                payment: {
                                  ...prev.payment,
                                  minimumOrderAmount: Number(e.target.value),
                                },
                              }
                            : null
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handlePaymentUpdate} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Payment Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site Settings */}
        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteTitle">Site Title</Label>
                    <Input
                      id="siteTitle"
                      value={settings.site.title || ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                site: { ...prev.site, title: e.target.value },
                              }
                            : null
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.site.theme?.primaryColor || ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                site: {
                                  ...prev.site,
                                  theme: {
                                    ...prev.site.theme,
                                    primaryColor: e.target.value,
                                  },
                                },
                              }
                            : null
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.site.description || ""}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              site: {
                                ...prev.site,
                                description: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Maintenance Mode</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.site.maintenanceMode}
                    onCheckedChange={handleMaintenanceToggle}
                  />
                  <Label>Enable Maintenance Mode</Label>
                </div>

                {settings.site.maintenanceMode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceMessage">
                      Maintenance Message
                    </Label>
                    <Textarea
                      id="maintenanceMessage"
                      value={settings.site.maintenanceMessage || ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                site: {
                                  ...prev.site,
                                  maintenanceMessage: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <Button onClick={handleSiteUpdate} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Site Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(settings.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </Label>
                      <p className="text-sm text-gray-500">
                        {key === "userRegistration" &&
                          "Allow new users to register"}
                        {key === "emailVerification" &&
                          "Require email verification for new accounts"}
                        {key === "twoFactorAuth" &&
                          "Enable two-factor authentication"}
                        {key === "guestCheckout" &&
                          "Allow checkout without registration"}
                        {key === "wishlist" && "Enable wishlist functionality"}
                        {key === "reviews" && "Enable product reviews"}
                        {key === "notifications" && "Enable push notifications"}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                features: { ...prev.features, [key]: checked },
                              }
                            : null
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              <Button onClick={handleFeaturesUpdate} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Feature Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(settings.notifications.email).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <Label className="text-base font-medium">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </Label>
                          </div>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) =>
                              setSettings((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      notifications: {
                                        ...prev.notifications,
                                        email: {
                                          ...prev.notifications.email,
                                          [key]: checked,
                                        },
                                      },
                                    }
                                  : null
                              )
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    SMS Notifications
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(settings.notifications.sms).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <Label className="text-base font-medium">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </Label>
                          </div>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) =>
                              setSettings((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      notifications: {
                                        ...prev.notifications,
                                        sms: {
                                          ...prev.notifications.sms,
                                          [key]: checked,
                                        },
                                      },
                                    }
                                  : null
                              )
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Push Notifications
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(settings.notifications.push).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <Label className="text-base font-medium">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </Label>
                          </div>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) =>
                              setSettings((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      notifications: {
                                        ...prev.notifications,
                                        push: {
                                          ...prev.notifications.push,
                                          [key]: checked,
                                        },
                                      },
                                    }
                                  : null
                              )
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <Button onClick={handleNotificationsUpdate} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Notification Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
