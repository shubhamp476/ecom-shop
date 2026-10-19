"use client";

import React, { useState, useEffect } from "react";
import {
  Percent,
  Plus,
  CheckCircle,
  RefreshCw,
  Ticket,
  Calendar,
  Users,
  Copy,
  Check,
  Power,
  Trash2,
  Search,
  Sparkles,
} from "lucide-react";
import { ICoupon } from "@/models/Coupon";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderValue, setMinOrderValue] = useState<number>(50);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [toast, setToast] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      const json = await res.json();
      if (json.success) setCoupons(json.coupons);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    showToast(`Copied "${couponCode}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleToggleStatus = async (coupon: ICoupon) => {
    const newStatus = coupon.status === "Active" ? "Disabled" : "Active";
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.code, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Coupon "${coupon.code}" is now ${newStatus}.`);
        fetchCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCoupon = async (couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons?code=${encodeURIComponent(couponCode)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Coupon "${couponCode}" deleted.`);
        fetchCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          description,
          discountType,
          discountValue,
          minOrderValue,
          usageLimit,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Coupon "${code.toUpperCase()}" created successfully!`);
        setCode("");
        setDescription("");
        setShowModal(false);
        fetchCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchSearch =
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && c.status === "Active") ||
      (filterStatus === "disabled" && c.status === "Disabled") ||
      (filterStatus === "expired" && (c.status === "Expired" || new Date(c.endDate) < new Date()));
    return matchSearch && matchStatus;
  });

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.status === "Active").length;
  const totalRedeemed = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);

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
            <Percent className="w-6 h-6 text-amber-500" />
            <span>Discounts & Coupon Campaigns</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure checkout discount vouchers, min basket restrictions, redemption limits, and promotional dates.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Campaigns
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{totalCoupons}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Stored promotional coupons</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active & Claimable</span>
          </span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{activeCoupons}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Currently redeemable in cart</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-amber-500 uppercase tracking-wider">
            Total Customer Claims
          </span>
          <p className="text-2xl font-bold text-amber-500 mt-1.5">{totalRedeemed.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Redemptions across store orders</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: "All Coupons" },
            { id: "active", label: "Active" },
            { id: "disabled", label: "Disabled" },
            { id: "expired", label: "Expired" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                filterStatus === tab.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "bg-slate-100 dark:bg-[#161c2b] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
            <span>Loading active promotions...</span>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-[#0f1420] rounded-2xl border border-slate-200 dark:border-slate-800">
            <Ticket className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">No coupons match your filter</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting the search keyword or filter.</p>
          </div>
        ) : (
          filteredCoupons.map((c) => {
            const usagePercent = Math.min(100, Math.round(((c.usedCount || 0) / (c.usageLimit || 1)) * 100));
            const isCopied = copiedCode === c.code;
            const isActive = c.status === "Active";

            return (
              <div
                key={c.code}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between space-y-4 relative overflow-hidden shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 flex-shrink-0">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono font-bold text-slate-900 dark:text-white text-base tracking-wider">
                            {c.code}
                          </h3>
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            title="Copy Code"
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT DISCOUNT`}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                    {c.description || "Active promotional checkout coupon."}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141a27] border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Min Order Value:</span>
                      <span className="font-semibold text-slate-800 dark:text-white">₹{c.minOrderValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Claims:</span>
                      <span className="font-semibold text-amber-500">
                        {c.usedCount} / {c.usageLimit} redeemed
                      </span>
                    </div>
                    {/* Usage Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Expires {new Date(c.endDate).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(c)}
                      title={isActive ? "Disable Coupon" : "Activate Coupon"}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        isActive
                          ? "text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isActive ? "Disable" : "Activate"}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(c.code)}
                      title="Delete Coupon"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Create New Coupon Campaign</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH25"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Campaign Description</label>
                <input
                  type="text"
                  placeholder="25% Off on All Gaming Accessories"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹ INR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Discount Value *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Usage Limit (Claims)</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
