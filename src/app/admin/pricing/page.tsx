"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  Percent,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Save,
  Check,
  Tag,
} from "lucide-react";
import { IProduct } from "@/models/Product";
import { ICategory } from "@/models/Category";

export default function AdminPricingPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Bulk Adjustment Tool
  const [adjustmentType, setAdjustmentType] = useState<"percentage" | "fixed">("percentage");
  const [adjustmentValue, setAdjustmentValue] = useState<number>(10);
  const [direction, setDirection] = useState<"discount" | "increase">("discount");

  // Inline Row Price Editing State
  const [editedPrices, setEditedPrices] = useState<{ [id: string]: number }>({});
  const [editedMrps, setEditedMrps] = useState<{ [id: string]: number }>({});
  const [savingRowId, setSavingRowId] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products?limit=100"),
        fetch("/api/admin/categories"),
      ]);
      const prodJson = await prodRes.json();
      const catJson = await catRes.json();

      if (prodJson.success) setProducts(prodJson.products);
      if (catJson.success) setCategories(catJson.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || p.categorySlug === selectedCategory;
    return matchSearch && matchCat;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => (p._id || p.id || p.sku) as string));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Inline row save
  const handleSaveInlinePrice = async (p: IProduct) => {
    const id = (p._id || p.id || p.sku) as string;
    const currentPrice = editedPrices[id] !== undefined ? editedPrices[id] : p.price;
    const currentMrp = editedMrps[id] !== undefined ? editedMrps[id] : p.mrp || p.price * 1.2;

    try {
      setSavingRowId(id);
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(currentPrice), mrp: Number(currentMrp) }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Saved price for "${p.name}".`);
        // Update local state
        setProducts((prev) =>
          prev.map((item) =>
            (item._id || item.id || item.sku) === id
              ? { ...item, price: Number(currentPrice), mrp: Number(currentMrp) }
              : item
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRowId(null);
    }
  };

  // Bulk Adjustment
  const handleApplyBulkPricing = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one product from the table below.");
      return;
    }

    try {
      setSaving(true);
      let updatedCount = 0;

      for (const id of selectedIds) {
        const product = products.find((p) => (p._id === id || p.id === id || p.sku === id));
        if (!product) continue;

        let newPrice = product.price;
        if (adjustmentType === "percentage") {
          const delta = product.price * (adjustmentValue / 100);
          newPrice = direction === "discount" ? product.price - delta : product.price + delta;
        } else {
          newPrice = direction === "discount" ? product.price - adjustmentValue : product.price + adjustmentValue;
        }

        newPrice = Math.max(1, Math.round(newPrice * 100) / 100);

        await fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: newPrice }),
        });
        updatedCount++;
      }

      showToast(`Updated pricing for ${updatedCount} products.`);
      setSelectedIds([]);
      setEditedPrices({});
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

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
            <DollarSign className="w-6 h-6 text-emerald-500" />
            <span>Pricing Workspace & Margin Engine</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate flash discounts, bulk price adjustments, margin targets, and store profitability in real time.
          </p>
        </div>
      </div>

      {/* Bulk Pricing Action Box */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Percent className="w-4 h-4 text-amber-500" />
          <span>Bulk Price Rule Simulator</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Adjustment Action
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="discount">Apply Discount / Price Drop</option>
              <option value="increase">Increase Price</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Adjustment Type
            </label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Adjustment Magnitude
            </label>
            <input
              type="number"
              min="1"
              value={adjustmentValue}
              onChange={(e) => setAdjustmentValue(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleApplyBulkPricing}
              disabled={saving || selectedIds.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Applying..." : `Apply to (${selectedIds.length}) Selected`}</span>
            </button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/40">
            Preview: Selected {selectedIds.length} products will have prices{" "}
            {direction === "discount" ? "decreased" : "increased"} by{" "}
            <strong>
              {adjustmentType === "percentage" ? `${adjustmentValue}%` : `₹${adjustmentValue}`}
            </strong>
            . Click "Apply" above to commit updates.
          </p>
        )}
      </div>

      {/* Filter and Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-60 bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#121826]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0"
                  />
                </th>
                <th className="py-3 px-4 font-medium">Product / SKU</th>
                <th className="py-3 px-4 font-medium">Cost Price (₹)</th>
                <th className="py-3 px-4 font-medium">MRP (₹)</th>
                <th className="py-3 px-4 font-medium">Selling Price (₹)</th>
                <th className="py-3 px-4 font-medium">Gross Profit</th>
                <th className="py-3 px-4 font-medium">Margin Health</th>
                <th className="py-3 px-4 font-medium text-right">Quick Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mx-auto mb-2" />
                    <span>Loading pricing matrix...</span>
                  </td>
                </tr>
              ) : filteredProducts.map((p) => {
                const id = (p._id || p.id || p.sku) as string;
                const cost = p.costPrice || Math.round(p.price * 0.7);

                const activeSellingPrice =
                  editedPrices[id] !== undefined ? editedPrices[id] : p.price;
                const activeMrp =
                  editedMrps[id] !== undefined ? editedMrps[id] : p.mrp || p.price * 1.2;

                const gross = Math.round((activeSellingPrice - cost) * 100) / 100;
                const margin = Math.round((gross / (activeSellingPrice || 1)) * 100);
                const isSelected = selectedIds.includes(id);
                const isSavingThis = savingRowId === id;
                const isDirty =
                  editedPrices[id] !== undefined || editedMrps[id] !== undefined;

                return (
                  <tr
                    key={id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                      isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(id)}
                        className="rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">{p.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{p.sku}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">₹{cost.toLocaleString("en-IN")}</td>

                    {/* Editable MRP */}
                    <td className="py-3 px-4">
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1.5 text-slate-400 font-medium">₹</span>
                        <input
                          type="number"
                          step="1"
                          value={activeMrp}
                          onChange={(e) =>
                            setEditedMrps({ ...editedMrps, [id]: Number(e.target.value) })
                          }
                          className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </td>

                    {/* Editable Selling Price */}
                    <td className="py-3 px-4">
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1.5 text-slate-400 font-medium">₹</span>
                        <input
                          type="number"
                          step="1"
                          value={activeSellingPrice}
                          onChange={(e) =>
                            setEditedPrices({ ...editedPrices, [id]: Number(e.target.value) })
                          }
                          className="w-full font-bold bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </td>

                    {/* Gross Profit */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          gross >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                        }`}
                      >
                        ₹{gross.toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Margin Health Pill */}
                    <td className="py-3 px-4">
                      {margin < 15 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1 w-max">
                          <AlertCircle className="w-3 h-3" />
                          <span>Low ({margin}%)</span>
                        </span>
                      ) : margin < 25 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 w-max block">
                          Fair ({margin}%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 w-max block">
                          Healthy ({margin}%)
                        </span>
                      )}
                    </td>

                    {/* Row Quick Save */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSaveInlinePrice(p)}
                        disabled={isSavingThis}
                        title="Save Updated Price"
                        className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                          isDirty
                            ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500"
                            : "text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {isSavingThis ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : isDirty ? (
                          <Save className="w-3.5 h-3.5" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
