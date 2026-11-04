"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Percent,
  Zap,
  X,
  Save,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatsData {
  kpis: {
    totalProducts: number;
    activeProducts: number;
    draftProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    totalInventoryValue: number;
    totalInventoryCost: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    grossProfit: number | null;
    profitMargin: number | null;
    totalCustomers: number;
  };
  charts: {
    salesOverTime: { month: string; revenue: number; orders: number }[];
    categoryDistribution: { name: string; value: number }[];
    ordersByStatus: { name: string; value: number }[];
  };
  widgets: {
    lowStockItems: any[];
    recentOrders: any[];
    recentActivity: any[];
  };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Quick Add Product
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [qaName, setQaName] = useState("");
  const [qaCategory, setQaCategory] = useState("Smartphones");
  const [qaPrice, setQaPrice] = useState("");
  const [qaMrp, setQaMrp] = useState("");
  const [qaStock, setQaStock] = useState("10");
  const [qaSaving, setQaSaving] = useState(false);
  const [qaSuccess, setQaSuccess] = useState(false);

  const handleQuickAdd = async () => {
    if (!qaName.trim() || !qaPrice) return;
    setQaSaving(true);
    try {
      const slug = qaName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: qaName,
          slug,
          category: qaCategory,
          categorySlug: qaCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          price: Number(qaPrice),
          mrp: Number(qaMrp || qaPrice),
          stock: Number(qaStock),
          status: "Active",
          brand: "Givolt",
          image: "/assets/69d4a654a45341b80906ff1c_1.avif",
          sku: `GV-${qaCategory.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        }),
      });
      if (res.ok) {
        setQaSuccess(true);
        setQaName("");
        setQaPrice("");
        setQaMrp("");
        setQaStock("10");
        setTimeout(() => { setQaSuccess(false); setShowQuickAdd(false); fetchStats(); }, 1200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQaSaving(false);
    }
  };

  const [loadError, setLoadError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else { setLoadError(json.error || "Unable to load dashboard"); }
    } catch (err) {
      setLoadError("Unable to reach the backend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loadError) return <p role="alert" className="p-6 text-red-500">{loadError}</p>;

  if (loading || !data) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 rounded-xl bg-slate-200 dark:bg-slate-800/80" />
            <div className="h-4 w-96 rounded-lg bg-slate-200 dark:bg-slate-800/50" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-slate-800/80" />
            <div className="h-9 w-32 rounded-xl bg-slate-200 dark:bg-slate-800/80" />
          </div>
        </div>

        {/* Skeleton Primary KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800/80" />
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800/80" />
              </div>
              <div className="h-7 w-32 rounded-lg bg-slate-200 dark:bg-slate-800/90" />
              <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800/50" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { kpis, charts, widgets } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Store Overview & Performance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics, inventory levels, and order operations across Givolt Electronics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="btn-secondary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
          <Link
            href="/admin/products/new"
            className="btn-primary flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Full Form</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              ₹{kpis.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Paid orders in the database</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{kpis.totalOrders}</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{kpis.pendingOrders} pending fulfillment</span>
            </div>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inventory Value</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              ₹{kpis.totalInventoryValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{kpis.totalProducts} unique SKUs cataloged</span>
            </div>
          </div>
        </div>

        {/* Gross Profit Margin */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estimated Profit Margin</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{kpis.profitMargin === null ? "Unavailable" : `${kpis.profitMargin}%`}</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
              <span>{kpis.grossProfit === null ? "Order cost data required" : `Gross Profit: ₹${kpis.grossProfit.toLocaleString("en-IN")}`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Quick Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/products?status=Active"
          className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400">Active Products</span>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{kpis.activeProducts}</span>
        </Link>

        <Link
          href="/admin/inventory"
          className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800/80 hover:border-amber-400 dark:hover:border-amber-700/60 transition shadow-sm"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400">Low Stock Alert</span>
          <span className="text-sm font-semibold text-amber-500">{kpis.lowStockProducts} items</span>
        </Link>

        <Link
          href="/admin/products?status=Out+of+Stock"
          className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800/80 hover:border-rose-400 dark:hover:border-rose-700/60 transition shadow-sm"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400">Out of Stock</span>
          <span className="text-sm font-semibold text-rose-500">{kpis.outOfStockProducts}</span>
        </Link>

        <Link
          href="/admin/customers"
          className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400">Registered Customers</span>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{kpis.totalCustomers}</span>
        </Link>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Revenue Trend */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Sales & Revenue Trend</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly gross electronics revenue trajectory</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              YTD 2026
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.salesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value: any) => [`₹${value}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock by Category Donut */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Stock by Category</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Inventory volume distribution</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-100 dark:border-slate-800">
            {charts.categoryDistribution.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operations Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Incoming purchase stream & fulfillment status</p>
            </div>
            <Link href="/admin/orders" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {widgets.recentOrders.map((order) => (
                  <tr key={order.orderNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">#{order.orderNumber}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{order.customerName}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">₹{order.total.toLocaleString("en-IN")}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        order.paymentStatus === "Paid"
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        order.fulfillmentStatus === "Delivered"
                          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                          : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                      }`}>
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Low Stock Items */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Restock Priorities</span>
              </h2>
              <Link href="/admin/inventory" className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline">
                Manage
              </Link>
            </div>
            <div className="space-y-3">
              {widgets.lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-3">All electronic inventory levels healthy.</p>
              ) : (
                widgets.lowStockItems.map((item) => (
                  <div
                    key={item.sku}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#141a27] border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-transparent p-0.5"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.sku}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg bg-amber-500/10 whitespace-nowrap">
                      {item.stock} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Operations Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-900/40 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/pricing"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/40 transition shadow-xs"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bulk Pricing</span>
              </Link>
              <Link
                href="/admin/import-export"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/40 transition shadow-xs"
              >
                <Boxes className="w-3.5 h-3.5 text-blue-500" />
                <span>CSV Center</span>
              </Link>
              <Link
                href="/admin/coupons"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/40 transition shadow-xs"
              >
                <Percent className="w-3.5 h-3.5 text-amber-500" />
                <span>Coupons</span>
              </Link>
              <Link
                href="/admin/logs"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/40 transition shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                <span>Audit Logs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Product Slide Panel */}
      {showQuickAdd && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowQuickAdd(false)} />
          <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-sm bg-white dark:bg-[#121826] border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10">
                  <Zap className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Add Product</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Rapid product creation</p>
                </div>
              </div>
              <button onClick={() => setShowQuickAdd(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 16 Pro Max"
                  value={qaName}
                  onChange={(e) => setQaName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Category</label>
                <select
                  value={qaCategory}
                  onChange={(e) => setQaCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option>Smartphones</option>
                  <option>Laptops</option>
                  <option>Audio & Sounds</option>
                  <option>Smart Home</option>
                  <option>Gaming Gadgets</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Selling Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="799"
                    value={qaPrice}
                    onChange={(e) => setQaPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="999"
                    value={qaMrp}
                    onChange={(e) => setQaMrp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Opening Stock</label>
                <input
                  type="number"
                  value={qaStock}
                  onChange={(e) => setQaStock(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {qaPrice && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Selling Price</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{Number(qaPrice).toLocaleString("en-IN")}</span>
                  </div>
                  {qaMrp && Number(qaMrp) > Number(qaPrice) && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Discount</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {Math.round(((Number(qaMrp) - Number(qaPrice)) / Number(qaMrp)) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                💡 For full details (images, specs, variants), use the{" "}
                <Link href="/admin/products/new" className="text-blue-500 hover:underline">full product form</Link>.
              </p>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleQuickAdd}
                disabled={!qaName.trim() || !qaPrice || qaSaving}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition ${
                  qaSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 disabled:opacity-40"
                }`}
              >
                {qaSuccess ? (
                  <><CheckCircle2 className="w-4 h-4" /> Product Created!</>
                ) : qaSaving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                ) : (
                  <><Save className="w-4 h-4" /> Create Product</>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
