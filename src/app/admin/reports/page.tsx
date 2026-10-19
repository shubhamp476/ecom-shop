"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const { kpis, charts, widgets } = data;

  const topSellingCategories = [
    { name: "Smartphones", revenue: 8490, profit: 2716, margin: 32 },
    { name: "Laptops", revenue: 6240, profit: 1872, margin: 30 },
    { name: "Audio & Sounds", revenue: 4180, profit: 1672, margin: 40 },
    { name: "Smart Home", revenue: 3250, profit: 1137, margin: 35 },
    { name: "Gaming Gadgets", revenue: 2890, profit: 1011, margin: 35 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-purple-500" />
            <span>Reports & Financial Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Category revenue performance, gross profit margins, inventory valuation, and slow-moving electronics.
          </p>
        </div>
        <a
          href="/api/admin/export?type=products"
          download
          className="btn-secondary flex items-center gap-1.5 bg-slate-100 dark:bg-[#161c2b] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/60 transition self-start"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics CSV</span>
        </a>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Sales</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹{kpis.totalRevenue.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">+18.4% growth</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estimated Profit</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">₹{kpis.grossProfit.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Net of COGS (Cost of Goods)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Store Margin</span>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{kpis.profitMargin}%</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Healthy electronics benchmark</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inventory at Cost</span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">₹{kpis.totalInventoryCost.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Capital locked in stock</span>
        </div>
      </div>

      {/* Chart: Category Revenue Breakdown */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
          Revenue by Category Breakdown
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Volume comparisons across consumer electronics divisions</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topSellingCategories} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                formatter={(val: any) => [`₹${val}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
          Category Profitability Index
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Sales Revenue</th>
                <th className="pb-3 font-medium">Gross Profit</th>
                <th className="pb-3 font-medium">Average Margin</th>
                <th className="pb-3 font-medium text-right">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {topSellingCategories.map((c) => (
                <tr key={c.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">₹{c.revenue.toLocaleString("en-IN")}</td>
                  <td className="py-3 font-semibold text-emerald-600 dark:text-emerald-400">₹{c.profit.toLocaleString("en-IN")}</td>
                  <td className="py-3 text-purple-600 dark:text-purple-400 font-semibold">{c.margin}%</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      High Growth
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
