"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  RefreshCw,
  Download,
  Printer,
  FileText,
  CreditCard,
  Save,
  Package,
} from "lucide-react";
import { IOrder } from "@/models/Order";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Editable modal fields for fulfillment & courier
  const [editFulfillment, setEditFulfillment] = useState("Pending");
  const [editCarrier, setEditCarrier] = useState("Delhivery");
  const [editTracking, setEditTracking] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) setOrders(json.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenDetails = (o: IOrder) => {
    setSelectedOrder(o);
    setEditFulfillment(o.fulfillmentStatus || "Pending");
    setEditCarrier(o.shippingCarrier || "Delhivery");
    setEditTracking(o.trackingNumber || "");
    setEditNotes(o.adminNotes || "");
  };

  const handleSaveOrderFulfillment = async () => {
    if (!selectedOrder) return;
    try {
      setUpdatingOrder(true);
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: selectedOrder.orderNumber,
          fulfillmentStatus: editFulfillment,
          shippingCarrier: editCarrier,
          trackingNumber: editTracking,
          adminNotes: editNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Order #${selectedOrder.orderNumber} updated!`);
        fetchOrders();
        setSelectedOrder({
          ...selectedOrder,
          fulfillmentStatus: editFulfillment as any,
          shippingCarrier: editCarrier,
          trackingNumber: editTracking,
          adminNotes: editNotes,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingOrder(false);
    }
  };

  const handleUpdateStatusInline = async (orderNumber: string, fulfillmentStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, fulfillmentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Order #${orderNumber} set to ${fulfillmentStatus}.`);
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!paymentFilter) return true;
    return o.paymentStatus?.toLowerCase() === paymentFilter.toLowerCase();
  });

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingCount = orders.filter((o) => o.fulfillmentStatus === "Pending").length;
  const shippedCount = orders.filter((o) => o.fulfillmentStatus === "Shipped").length;
  const deliveredCount = orders.filter((o) => o.fulfillmentStatus === "Delivered").length;

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
            <ShoppingCart className="w-6 h-6 text-blue-500" />
            <span>Orders & Fulfillment Dispatch</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track customer transactions, courier tracking numbers, packing dispatch, tax invoices, and returns.
          </p>
        </div>
        <a
          href="/api/admin/export?type=orders"
          download
          className="btn-secondary flex items-center gap-1.5 bg-slate-100 dark:bg-[#161c2b] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/60 transition self-start"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Orders CSV</span>
        </a>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Orders Placed
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{orders.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Lifetime store transactions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Dispatch</span>
          </span>
          <p className="text-2xl font-bold text-amber-500 mt-1.5">{pendingCount}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting warehouse packaging</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-blue-500 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            <span>In Transit</span>
          </span>
          <p className="text-2xl font-bold text-blue-500 mt-1.5">{shippedCount}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Dispatched with active AWB</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Total Gross Revenue
          </span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
            ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{deliveredCount} successfully delivered</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search order #, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          {/* Fulfillment Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Fulfillment</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Return Requested">Return Requested</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full sm:w-44 bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Payment</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Payment Pending</option>
            <option value="Refunded">Refunded</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#121826]">
                <th className="py-3 px-4 font-medium">Order Number</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Items</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Payment</th>
                <th className="py-3 px-4 font-medium">Fulfillment Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800/80" /></td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-800/80" />
                        <div className="h-2.5 w-36 rounded bg-slate-200 dark:bg-slate-800/50" />
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800/80" /></td>
                    <td className="py-4 px-4"><div className="h-3.5 w-16 rounded bg-slate-200 dark:bg-slate-800/80" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800/80" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-800/80" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-6 w-16 rounded-lg ml-auto bg-slate-200 dark:bg-slate-800/80" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-inner">
                      <ShoppingCart className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No orders found</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      No customer orders match your search and filter parameters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.orderNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      #{o.orderNumber}
                      {o.trackingNumber && (
                        <span className="block text-[10px] font-normal text-blue-500">
                          {o.shippingCarrier}: {o.trackingNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{o.customer.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{o.customer.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                      {o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">₹{o.total.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          o.paymentStatus === "Paid"
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {o.paymentStatus} ({o.paymentMethod})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.fulfillmentStatus}
                        onChange={(e) => handleUpdateStatusInline(o.orderNumber, e.target.value)}
                        className="bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Return Requested">Return Requested</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetails(o)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View Order Details & Tracking"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setShowInvoiceModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Print Tax Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Courier Dispatch Modal */}
      {selectedOrder && !showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Placed on {new Date(selectedOrder.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Courier Dispatch & Tracking Editor Box */}
            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
              <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 block tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Courier Dispatch & Tracking Management</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={editCarrier}
                    onChange={(e) => setEditCarrier(e.target.value)}
                    className="w-full bg-white dark:bg-[#182032] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Delhivery">Delhivery Express</option>
                    <option value="BlueDart">Blue Dart Express</option>
                    <option value="DTDC">DTDC Courier</option>
                    <option value="FedEx">FedEx Electronics</option>
                    <option value="DHL">DHL Express</option>
                    <option value="Ekart">Ekart Logistics</option>
                    <option value="India Post">India Post Speed Post</option>
                    <option value="Shadowfax">Shadowfax Hyperlocal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tracking AWB Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL982347102IN"
                    value={editTracking}
                    onChange={(e) => setEditTracking(e.target.value)}
                    className="w-full bg-white dark:bg-[#182032] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={editFulfillment}
                    onChange={(e) => setEditFulfillment(e.target.value)}
                    className="w-full bg-white dark:bg-[#182032] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Pending">Pending (Unfulfilled)</option>
                    <option value="Processing">Processing (Packing)</option>
                    <option value="Shipped">Shipped (Dispatched)</option>
                    <option value="Delivered">Delivered (Completed)</option>
                    <option value="Return Requested">Return Requested</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Internal Dispatch Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fragile tamper seal applied"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-white dark:bg-[#182032] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveOrderFulfillment}
                disabled={updatingOrder}
                className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{updatingOrder ? "Updating..." : "Save Tracking & Status"}</span>
              </button>
            </div>

            {/* Customer & Shipping */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
                Shipping Destination & Contact
              </span>
              <p className="font-semibold text-slate-900 dark:text-white">
                {selectedOrder.customer.name} ({selectedOrder.customer.phone})
              </p>
              <p className="text-slate-700 dark:text-slate-300">{selectedOrder.customer.shippingAddress?.street}</p>
              <p className="text-slate-500 dark:text-slate-400">
                {selectedOrder.customer.shippingAddress?.city}, {selectedOrder.customer.shippingAddress?.state} -{" "}
                {selectedOrder.customer.shippingAddress?.postalCode}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
                Order Items ({selectedOrder.items.length})
              </span>
              {selectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#141a27] border border-slate-200 dark:border-slate-800/80"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-9 h-9 rounded-lg object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-transparent p-1"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900 dark:text-white">₹{item.price.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-slate-400 block">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-800 space-y-1.5 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST 18%):</span>
                <span>₹{selectedOrder.tax.toLocaleString("en-IN")}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-amber-500">
                  <span>Discount:</span>
                  <span>-₹{selectedOrder.discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount:</span>
                <span>₹{selectedOrder.total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600 text-purple-600 hover:text-white font-semibold transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tax Invoice</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice / Packing Slip Modal */}
      {selectedOrder && showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white text-slate-900 p-6 shadow-2xl text-xs space-y-4 max-h-[92vh] overflow-y-auto print:shadow-none print:m-0 print:p-0">
            {/* Action Bar (Hidden during window.print()) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Commercial Tax Invoice & Packing Slip Preview</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Back
                </button>
              </div>
            </div>

            {/* Document Sheet Body */}
            <div className="border border-slate-300 rounded-xl p-6 bg-white space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">REA ELECTRONICS STORE</h2>
                  <p className="text-[11px] text-slate-600">Enterprise Consumer Electronics & Hardware</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    GSTIN: 27AABCR8901F1Z2 • CIN: U72200MH2023PTC345678
                  </p>
                  <p className="text-[10px] text-slate-500">Tech Park, Andheri East, Mumbai, Maharashtra 400069</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-md bg-purple-100 text-purple-800 font-black text-xs uppercase tracking-wider block mb-1">
                    Tax Invoice
                  </span>
                  <p className="font-bold text-slate-900 text-sm">#{selectedOrder.orderNumber}</p>
                  <p className="text-[10px] text-slate-500">
                    Date: {new Date(selectedOrder.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Billed To / Shipped To */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                    Bill To:
                  </span>
                  <p className="font-bold text-slate-900">{selectedOrder.customer.name}</p>
                  <p className="text-slate-600">{selectedOrder.customer.email}</p>
                  <p className="text-slate-600">{selectedOrder.customer.phone}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                    Ship To & Courier:
                  </span>
                  <p className="font-bold text-slate-900">{selectedOrder.customer.shippingAddress?.street}</p>
                  <p className="text-slate-600">
                    {selectedOrder.customer.shippingAddress?.city}, {selectedOrder.customer.shippingAddress?.state} -{" "}
                    {selectedOrder.customer.shippingAddress?.postalCode}
                  </p>
                  <p className="text-blue-700 font-semibold text-[11px] mt-1">
                    Carrier: {selectedOrder.shippingCarrier || "Delhivery"} • AWB:{" "}
                    {selectedOrder.trackingNumber || "Pending"}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="py-2 px-3 font-semibold">SKU / Item</th>
                    <th className="py-2 px-3 font-semibold text-center">Qty</th>
                    <th className="py-2 px-3 font-semibold text-right">Unit Rate (₹)</th>
                    <th className="py-2 px-3 font-semibold text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] font-mono text-slate-500">SKU: {item.sku}</p>
                      </td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-800">{item.quantity}</td>
                      <td className="py-2 px-3 text-right text-slate-700">₹{item.price.toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Price Calculation */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-1.5 border-t border-slate-200 pt-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span>₹{selectedOrder.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (CGST+SGST 18%):</span>
                    <span>₹{selectedOrder.tax.toLocaleString("en-IN")}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promotional Discount:</span>
                      <span>-₹{selectedOrder.discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-slate-900 text-sm border-t border-slate-300 pt-1.5">
                    <span>Invoice Grand Total:</span>
                    <span>₹{selectedOrder.total.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 text-right mt-1">
                    Payment Mode: {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                  </p>
                </div>
              </div>

              {/* Signatory Footnote */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">Terms & Conditions:</p>
                  <p>1. Warranty covered per manufacturer standard policies.</p>
                  <p>2. Computer generated tax invoice. No signature required.</p>
                </div>
                <div className="text-right">
                  <div className="h-10 w-28 border-b border-dashed border-slate-400 ml-auto mb-1" />
                  <p className="font-semibold text-slate-700">Authorized Signatory</p>
                  <p>REA Electronics Logistics Hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
