"use client";

import React, { useState, useEffect } from "react";
import { History, ShieldCheck, Search, RefreshCw, Clock, User, Filter } from "lucide-react";
import { IActivityLog } from "@/models/ActivityLog";
import { IInventoryLog } from "@/models/InventoryLog";

export default function AdminLogsPage() {
  const [activityLogs, setActivityLogs] = useState<IActivityLog[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<IInventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"activity" | "inventory">("activity");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/logs");
      const json = await res.json();
      if (json.success) {
        setActivityLogs(json.activityLogs);
        setInventoryLogs(json.inventoryLogs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredActivity = activityLogs.filter(
    (l) =>
      !search ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInventory = inventoryLogs.filter(
    (l) =>
      !search ||
      l.productName.toLowerCase().includes(search.toLowerCase()) ||
      l.sku.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-purple-500" />
            <span>Audit Trail & Activity Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable administrative logs capturing price adjustments, inventory transfers, and role actions.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="btn-secondary flex items-center gap-1.5 bg-white dark:bg-[#161c2b] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700/60 shadow-xs transition self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "activity"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                : "bg-slate-800/60 text-slate-400 hover:text-white"
            }`}
          >
            System & Product Activity ({activityLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "inventory"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                : "bg-slate-800/60 text-slate-400 hover:text-white"
            }`}
          >
            Stock Movement Trail ({inventoryLogs.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search action, actor, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161c2b] border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="rounded-2xl bg-[#0f1420] border border-slate-800 p-5 space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-500 mx-auto mb-2" />
            <span>Loading audit records...</span>
          </div>
        ) : activeTab === "activity" ? (
          filteredActivity.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-xs">No activity logs recorded.</p>
          ) : (
            filteredActivity.map((log, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3.5 rounded-xl bg-[#141a27] border border-slate-800/80 text-xs"
              >
                <div className="space-y-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-purple-500/20 text-purple-400">
                      {log.action}
                    </span>
                    <span className="font-semibold text-white">{log.actor}</span>
                    <span className="text-[11px] text-slate-500">({log.role})</span>
                  </div>
                  <p className="text-slate-300 text-xs">{log.details}</p>
                </div>
                <div className="text-right flex-shrink-0 text-[11px] text-slate-400">
                  <span className="block font-mono text-slate-500">{log.ipAddress || "127.0.0.1"}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))
          )
        ) : filteredInventory.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-xs">No inventory movement logs recorded.</p>
        ) : (
          filteredInventory.map((log, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-3.5 rounded-xl bg-[#141a27] border border-slate-800/80 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{log.productName}</span>
                  <span className="font-mono text-[11px] text-slate-400">({log.sku})</span>
                </div>
                <p className="text-slate-300 text-xs">{log.reason}</p>
                <p className="text-[11px] text-slate-500">Recorded by: {log.actor}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`font-bold text-xs ${log.quantityChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {log.quantityChange >= 0 ? `+${log.quantityChange}` : log.quantityChange} units
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {log.previousStock} → {log.newStock}
                </span>
                <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
