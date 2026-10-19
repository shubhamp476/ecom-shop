"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle, RefreshCw, Store, ShieldAlert, Sun, Moon, Palette } from "lucide-react";
import { IStoreSettings } from "@/models/StoreSettings";
import { useAdminTheme } from "@/components/admin/AdminThemeProvider";

export default function AdminSettingsPage() {
  const { theme, setTheme } = useAdminTheme();
  const [settings, setSettings] = useState<IStoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success) setSettings(json.settings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Store settings saved successfully!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-blue-500" />
            <span>Store Configuration & Policies</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global store metadata, currency, GST tax rates, free shipping thresholds, and customer service.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition self-start"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Configuration"}</span>
        </button>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Panel Appearance & Theme */}
        <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-400" />
              <span>Admin Interface Appearance</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Current: <span className="font-semibold text-blue-400 capitalize">{theme} Mode</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Customize the look and feel of your electronics management workspace. Choose between high-contrast Dark Mode and crisp, clean Light Mode.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border flex items-center gap-3 transition text-left ${
                theme === "dark"
                  ? "border-blue-500 bg-blue-600/10 ring-1 ring-blue-500"
                  : "border-slate-800 bg-[#161c2b] hover:border-slate-700"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shadow-inner">
                <Moon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Dark Mode</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">High contrast, deep slate & OLED black</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border flex items-center gap-3 transition text-left ${
                theme === "light"
                  ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                  : "border-slate-800 bg-[#161c2b] hover:border-slate-700"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 shadow-sm">
                <Sun className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Light Mode</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Clean daylight contrast, white cards & slate accents</span>
              </div>
            </button>
          </div>
        </div>

        {/* General Store Details */}
        <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" />
            <span>Store Identity</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Store Public Name</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full bg-[#161c2b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Tagline</label>
            <input
              type="text"
              value={settings.storeTagline}
              onChange={(e) => setSettings({ ...settings, storeTagline: e.target.value })}
              className="w-full bg-[#161c2b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    currency: e.target.value as any,
                    currencySymbol: e.target.value === "INR" ? "₹" : e.target.value === "EUR" ? "€" : "$",
                  })
                }
                className="w-full bg-[#161c2b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Default GST Tax Rate (%)</label>
              <input
                type="number"
                value={settings.defaultTaxRate}
                onChange={(e) => setSettings({ ...settings, defaultTaxRate: Number(e.target.value) })}
                className="w-full bg-[#161c2b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Thresholds */}
        <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Fulfillment & Thresholds</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Low Stock Alert Level</label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                className="w-full bg-[#161c2b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Free Shipping Minimum (₹)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full bg-[#161c2b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full bg-[#161c2b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Support Helpline</label>
            <input
              type="text"
              value={settings.supportPhone}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              className="w-full bg-[#161c2b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.codEnabled}
                onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="text-xs text-slate-300 font-medium">Enable Cash on Delivery (COD) Checkout</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
