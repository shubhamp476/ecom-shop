"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Award,
  Plus,
  CheckCircle,
  Eye,
  ShieldCheck,
  CreditCard,
  Crown,
  Save,
  Filter,
} from "lucide-react";
import { ICustomer } from "@/models/Customer";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // New Customer Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [tier, setTier] = useState<"Standard" | "Silver" | "Gold" | "VIP">("Standard");
  const [notes, setNotes] = useState("");

  // Edit Customer Modal State
  const [editTier, setEditTier] = useState<"Standard" | "Silver" | "Gold" | "VIP">("Standard");
  const [editStatus, setEditStatus] = useState<"Active" | "Inactive" | "Blocked">("Active");
  const [editNotes, setEditNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const json = await res.json();
      if (json.success) setCustomers(json.customers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, city, state, tier, notes }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Customer account for "${name}" created.`);
        setName("");
        setEmail("");
        setPhone("");
        setNotes("");
        setShowAddModal(false);
        fetchCustomers();
      } else {
        alert(json.error || "Failed to create customer");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenProfile = (c: ICustomer) => {
    setSelectedCustomer(c);
    setEditTier(c.tier);
    setEditStatus(c.status);
    setEditNotes(c.notes || "");
  };

  const handleSaveCustomerProfile = async () => {
    if (!selectedCustomer) return;
    try {
      setSavingEdit(true);
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedCustomer.email,
          tier: editTier,
          status: editStatus,
          notes: editNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Customer "${selectedCustomer.name}" updated!`);
        fetchCustomers();
        setSelectedCustomer({
          ...selectedCustomer,
          tier: editTier,
          status: editStatus,
          notes: editNotes,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchTier = tierFilter === "all" || c.tier.toLowerCase() === tierFilter.toLowerCase();
    const matchStatus = statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchTier && matchStatus;
  });

  const totalSpentAll = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const vipCount = customers.filter((c) => c.tier === "VIP" || c.tier === "Gold").length;
  const activeCount = customers.filter((c) => c.status === "Active").length;

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
            <Users className="w-6 h-6 text-blue-500" />
            <span>Customer Directory & Segments</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered customer accounts, purchasing volume, VIP status tiers, and shipping locations.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Customer Accounts
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{customers.length}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {activeCount} Active buyers
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" />
            <span>VIP & Gold Members</span>
          </span>
          <p className="text-2xl font-bold text-amber-500 mt-1.5">{vipCount}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">High lifetime value customers</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-blue-500 uppercase tracking-wider">
            Cumulative Lifetime Spend
          </span>
          <p className="text-2xl font-bold text-blue-500 mt-1.5">
            ₹{totalSpentAll.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Across all registered electronics buyers</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full sm:w-40 bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Tiers</option>
            <option value="vip">VIP Only</option>
            <option value="gold">Gold Only</option>
            <option value="silver">Silver Only</option>
            <option value="standard">Standard</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-36 bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
            <span>Loading customer accounts...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-[#0f1420] rounded-2xl border border-slate-200 dark:border-slate-800">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">No customers found</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting the search keyword or tier filter.</p>
          </div>
        ) : (
          filteredCustomers.map((c, idx) => {
            const isVIP = c.tier === "VIP" || c.tier === "Gold";

            return (
              <div
                key={c.email || idx}
                onClick={() => handleOpenProfile(c)}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-sm group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-blue-500 transition">
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Award
                          className={`w-3.5 h-3.5 ${
                            c.tier === "VIP"
                              ? "text-purple-500"
                              : c.tier === "Gold"
                              ? "text-amber-500"
                              : c.tier === "Silver"
                              ? "text-slate-400"
                              : "text-blue-500"
                          }`}
                        />
                        <span
                          className={`text-[11px] font-bold ${
                            c.tier === "VIP"
                              ? "text-purple-600 dark:text-purple-400"
                              : c.tier === "Gold"
                              ? "text-amber-600 dark:text-amber-400"
                              : c.tier === "Silver"
                              ? "text-slate-500 dark:text-slate-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {c.tier} Member
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.status === "Active"
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : c.status === "Blocked"
                          ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        {c.city}, {c.state}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{c.totalOrders} Orders Placed</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{c.totalSpent.toLocaleString("en-IN")} Lifetime
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Register New Customer Account</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="customer@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">State</label>
                  <input
                    type="text"
                    placeholder="Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Membership Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Standard">Standard Tier</option>
                  <option value="Silver">Silver Tier (5% Discount)</option>
                  <option value="Gold">Gold Tier (10% Discount)</option>
                  <option value="VIP">VIP Platinum (Priority Dispatch)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">CRM / Account Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Corporate procurement account"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30"
                >
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Profile & Tier Manager Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{selectedCustomer.name}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Registered {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : "Customer"}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Lifetime Metrics Box */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Total Orders Placed
                </span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedCustomer.totalOrders} Orders
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Cumulative Spend
                </span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-[#141a27] border border-slate-200 dark:border-slate-800/80">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block tracking-wider mb-1">
                Contact & Location Details
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Email:</strong> {selectedCustomer.email}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Phone:</strong> {selectedCustomer.phone}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Address:</strong> {selectedCustomer.city}, {selectedCustomer.state}, {selectedCustomer.country}
              </p>
            </div>

            {/* Account Tier & Status Settings */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
                CRM Account Privileges
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Loyalty Tier</label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="VIP">VIP Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked / Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Account Notes</label>
                <input
                  type="text"
                  placeholder="Notes about this client..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveCustomerProfile}
                disabled={savingEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingEdit ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
