"use client";

import React, { useState, useEffect } from "react";
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Plus,
  RefreshCw,
  CheckCircle,
  History,
  Download,
  AlertOctagon,
  Sparkles,
  Layers,
} from "lucide-react";
import { IProduct } from "@/models/Product";
import { IInventoryLog } from "@/models/InventoryLog";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [logs, setLogs] = useState<IInventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockTab, setStockTab] = useState<"all" | "low" | "out">("all");

  // Stock Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(10);
  const [adjustmentType, setAdjustmentType] = useState<"stock_in" | "stock_out">("stock_in");
  const [reason, setReason] = useState("Restocked from supplier purchase order");
  const [adjusting, setAdjusting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [prodRes, logsRes] = await Promise.all([
        fetch("/api/admin/products?limit=100"),
        fetch("/api/admin/logs"),
      ]);
      const prodJson = await prodRes.json();
      const logsJson = await logsRes.json();

      if (prodJson.success) setProducts(prodJson.products);
      if (logsJson.success) setLogs(logsJson.inventoryLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Quick 1-click restock
  const handleQuickRestock = async (product: IProduct, qtyToAdd: number) => {
    try {
      const id = (product._id || product.id || product.sku) as string;
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          type: "stock_in",
          quantityChange: qtyToAdd,
          reason: `Express restock of +${qtyToAdd} units`,
          actor: "Warehouse Manager",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(`Added +${qtyToAdd} units to "${product.name}".`);
        fetchInventory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setAdjusting(true);
      const delta = adjustmentType === "stock_in" ? Math.abs(adjustmentQuantity) : -Math.abs(adjustmentQuantity);
      const id = (selectedProduct._id || selectedProduct.id || selectedProduct.sku) as string;

      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          type: adjustmentType,
          quantityChange: delta,
          reason,
          actor: "Warehouse Supervisor",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setSelectedProduct(null);
        fetchInventory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdjusting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const isLow = p.stock <= (p.reorderLevel || 5);
    const isOut = p.stock <= 0;

    if (stockTab === "low") return matchSearch && isLow && !isOut;
    if (stockTab === "out") return matchSearch && isOut;
    return matchSearch;
  });

  const totalStockOnHand = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= (p.reorderLevel || 5)).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-amber-500" />
            <span>Inventory Tracking & Warehouse Stock</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time physical counts, safety reorder thresholds, express restock, and movement ledgers.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/api/admin/export?type=inventory"
            download
            className="btn-secondary flex items-center gap-1.5 bg-slate-100 dark:bg-[#161c2b] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/60 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Stock CSV</span>
          </a>
        </div>
      </div>

      {/* Out of Stock Alert Banner */}
      {outOfStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-rose-700 dark:text-rose-300 text-sm">
                Attention: {outOfStockCount} SKU{outOfStockCount > 1 ? "s are" : " is"} Completely Depleted
              </h4>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                Products currently out of stock will show as unavailable on the storefront checkout.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStockTab("out")}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm flex-shrink-0"
          >
            View Out of Stock
          </button>
        </div>
      )}

      {/* Inventory Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
            Total Physical Stock Units
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {totalStockOnHand.toLocaleString()} units
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Across central hubs & fulfillment racks</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-amber-500 uppercase tracking-wider font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Threshold Warnings</span>
          </span>
          <p className="text-2xl font-bold text-amber-500 mt-1.5">{lowStockCount} items</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Approaching minimum safety level</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-rose-500 uppercase tracking-wider font-medium flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Depleted / Zero Stock</span>
          </span>
          <p className="text-2xl font-bold text-rose-500 mt-1.5">{outOfStockCount} items</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Purchase orders need placement</span>
        </div>
      </div>

      {/* Table & Filter Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tab Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStockTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                stockTab === "all"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "bg-slate-100 dark:bg-[#161c2b] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All SKUs ({products.length})
            </button>
            <button
              onClick={() => setStockTab("low")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                stockTab === "low"
                  ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                  : "bg-slate-100 dark:bg-[#161c2b] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock ({lowStockCount})</span>
            </button>
            <button
              onClick={() => setStockTab("out")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                stockTab === "out"
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                  : "bg-slate-100 dark:bg-[#161c2b] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Out of Stock ({outOfStockCount})</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#121826]">
                <th className="py-3 px-4 font-medium">Product / SKU</th>
                <th className="py-3 px-4 font-medium">Warehouse Rack</th>
                <th className="py-3 px-4 font-medium">Stock On Hand</th>
                <th className="py-3 px-4 font-medium">Reserved</th>
                <th className="py-3 px-4 font-medium">Available</th>
                <th className="py-3 px-4 font-medium">Status / Reorder</th>
                <th className="py-3 px-4 font-medium text-right">Stock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800/80" />
                        <div className="space-y-1">
                          <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-800/80" />
                          <div className="h-2 w-16 rounded bg-slate-200 dark:bg-slate-800/50" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800/80" /></td>
                    <td className="py-3 px-4"><div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-800/80" /></td>
                    <td className="py-3 px-4"><div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-800/80" /></td>
                    <td className="py-3 px-4"><div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-800/80" /></td>
                    <td className="py-3 px-4"><div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-800/80" /></td>
                    <td className="py-3 px-4 text-right"><div className="h-6 w-16 rounded-lg ml-auto bg-slate-200 dark:bg-slate-800/80" /></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <span>No inventory records match this filter.</span>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOut = p.stock <= 0;
                  const isLow = !isOut && p.stock <= (p.reorderLevel || 5);

                  return (
                    <tr key={p.sku} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-transparent p-1"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{p.name}</p>
                            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {p.warehouseLocation || "Central Hub"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{p.stock}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{p.reservedStock || 0}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {p.availableStock !== undefined ? p.availableStock : p.stock}
                      </td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Reorder ({p.reorderLevel || 5})
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">Healthy</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Express +10 Shortcut */}
                          <button
                            onClick={() => handleQuickRestock(p, 10)}
                            title="Quick restock +10 units"
                            className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-lg text-[10px] font-bold transition border border-emerald-200 dark:border-emerald-800/40"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg text-xs font-semibold transition"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Adjust Inventory Stock</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedProduct.name} ({selectedProduct.sku})
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Adjustment Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType("stock_in")}
                    className={`py-2 rounded-xl font-semibold transition ${
                      adjustmentType === "stock_in"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    + Stock-In (Restock)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType("stock_out")}
                    className={`py-2 rounded-xl font-semibold transition ${
                      adjustmentType === "stock_out"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    - Stock-Out (Loss/Damage)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Audit Reason / PO Reference *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Received shipment from supplier Apex Wholesale"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                Current Stock: <strong>{selectedProduct.stock}</strong> → New Stock:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {adjustmentType === "stock_in"
                    ? selectedProduct.stock + adjustmentQuantity
                    : Math.max(0, selectedProduct.stock - adjustmentQuantity)}
                </strong>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30"
                >
                  {adjusting ? "Updating..." : "Confirm Stock Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Audit Log Section */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-blue-500" />
          <span>Recent Stock Movement Audit Trail</span>
        </h2>
        <div className="space-y-2">
          {logs.slice(0, 5).map((log, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#141a27] border border-slate-200 dark:border-slate-800/80 text-xs"
            >
              <div className="min-w-0">
                <span className="font-semibold text-slate-900 dark:text-white">{log.productName}</span>{" "}
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">({log.sku})</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {log.reason} • Actor: {log.actor}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`font-bold ${log.quantityChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                  {log.quantityChange >= 0 ? `+${log.quantityChange}` : log.quantityChange} units
                </span>
                <p className="text-[10px] text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
