"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  ExternalLink,
  Star,
  CheckCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Copy,
  Eye,
  EyeOff,
  X,
  Check,
  Pencil,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { IProduct } from "@/models/Product";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [categoriesList, setCategoriesList] = useState<{ name: string; slug: string }[]>([]);

  // Inline edit state
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Context menu
  const [contextMenu, setContextMenu] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.categories) {
          setCategoriesList(json.categories);
        }
      })
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        category,
        brand,
        status,
        sort,
        page: page.toString(),
        limit: "12",
      });
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.products);
        setTotalPages(json.pagination.totalPages);
        setTotalCount(json.pagination.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, category, brand, status, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleFeatured = async (product: IProduct) => {
    const id = product._id || product.id || product.sku;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !product.featured }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            (p._id === id || p.id === id || p.sku === id) ? { ...p, featured: !p.featured } : p
          )
        );
        showToast(`${product.featured ? "Removed from" : "Added to"} featured`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast(`"${name}" deleted`);
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (product: IProduct) => {
    try {
      const payload = {
        ...product,
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
        sku: `${product.sku}-COPY`,
        status: "Draft",
        _id: undefined,
        id: undefined,
      };
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(`Duplicated "${product.name}"`);
        fetchProducts();
      }
    } catch (e) {
      showToast("Failed to duplicate", "error");
    }
  };

  const handleInlineEdit = async (product: IProduct, field: string, value: string) => {
    const id = product._id || product.id || product.sku;
    const numVal = Number(value);
    let body: any = {};

    if (field === "stock") body = { stock: numVal, availableStock: numVal };
    else if (field === "price") body = { price: numVal };
    else if (field === "status") body = { status: value };
    else return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            (p._id === id || p.id === id || p.sku === id) ? { ...p, ...body } : p
          )
        );
        showToast(`Updated ${field} for "${product.name}"`);
      }
    } catch (e) {
      showToast(`Failed to update ${field}`, "error");
    }
    setEditingCell(null);
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/admin/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      showToast(`${selectedIds.length} products marked as ${newStatus}`);
      setSelectedIds([]);
      fetchProducts();
    } catch {
      showToast("Bulk update failed", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} selected products?`)) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/admin/products/${id}`, { method: "DELETE" })
        )
      );
      showToast(`Deleted ${selectedIds.length} products`);
      setSelectedIds([]);
      fetchProducts();
    } catch {
      showToast("Bulk delete failed", "error");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p._id || p.id || p.sku));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const hasActiveFilters = Boolean(search) || Boolean(category) || Boolean(status) || sort !== "newest";

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "Active":
        return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25";
      case "Draft":
        return "bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600";
      case "Out of Stock":
        return "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            Product Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {totalCount} products · Click any cell to quick-edit
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export?type=products"
            download
            className="btn-secondary inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </a>
          <Link
            href="/admin/products/new"
            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            New Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, SKU, model..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="stock_low">Stock: Low → High</option>
            <option value="name_asc">Name: A → Z</option>
          </select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[11px] font-medium border border-blue-200 dark:border-blue-500/20">
                &quot;{search}&quot;
                <button onClick={() => setSearch("")} className="hover:text-blue-900 dark:hover:text-blue-200"><X className="w-3 h-3" /></button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[11px] font-medium border border-indigo-200 dark:border-indigo-500/20">
                {category}
                <button onClick={() => setCategory("")} className="hover:text-indigo-900 dark:hover:text-indigo-200"><X className="w-3 h-3" /></button>
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium border border-emerald-200 dark:border-emerald-500/20">
                {status}
                <button onClick={() => setStatus("")} className="hover:text-emerald-900 dark:hover:text-emerald-200"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => { setSearch(""); setCategory(""); setStatus(""); setSort("newest"); setPage(1); }}
              className="ml-auto text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 text-xs">
            <span className="font-medium text-blue-700 dark:text-blue-200">
              {selectedIds.length} selected
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleBulkStatusUpdate("Active")}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
              >
                Set Active
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("Draft")}
                className="px-2.5 py-1 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-medium transition"
              >
                Set Draft
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-[#121826]">
                <th className="py-2.5 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0"
                  />
                </th>
                <th className="py-2.5 px-3 font-medium">Product</th>
                <th className="py-2.5 px-3 font-medium">SKU</th>
                <th className="py-2.5 px-3 font-medium">Category</th>
                <th className="py-2.5 px-3 font-medium">Price (₹)</th>
                <th className="py-2.5 px-3 font-medium">Stock</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium text-center w-10">⭐</th>
                <th className="py-2.5 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-3"><div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" /></td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                        <div className="space-y-1.5"><div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" /><div className="h-2 w-16 rounded bg-slate-100 dark:bg-slate-800/50" /></div>
                      </div>
                    </td>
                    <td className="py-3 px-3"><div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" /></td>
                    <td className="py-3 px-3"><div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" /></td>
                    <td className="py-3 px-3"><div className="h-3 w-14 rounded bg-slate-200 dark:bg-slate-800" /></td>
                    <td className="py-3 px-3"><div className="h-3 w-10 rounded bg-slate-200 dark:bg-slate-800" /></td>
                    <td className="py-3 px-3"><div className="h-5 w-14 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                    <td className="py-3 px-3 text-center"><div className="h-4 w-4 rounded mx-auto bg-slate-200 dark:bg-slate-800" /></td>
                    <td className="py-3 px-3 text-right"><div className="h-4 w-12 rounded ml-auto bg-slate-200 dark:bg-slate-800" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto mb-3">
                      <Package className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No products found</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                      Try adjusting your filters or create a new product.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {hasActiveFilters && (
                        <button
                          onClick={() => { setSearch(""); setCategory(""); setStatus(""); setSort("newest"); setPage(1); }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          Clear Filters
                        </button>
                      )}
                      <Link
                        href="/admin/products/new"
                        className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        + Create Product
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const id = product._id || product.id || product.sku;
                  const isSelected = selectedIds.includes(id);
                  const isEditingStock = editingCell?.id === id && editingCell?.field === "stock";
                  const isEditingPrice = editingCell?.id === id && editingCell?.field === "price";

                  return (
                    <tr
                      key={id}
                      className={`transition group ${
                        isSelected
                          ? "bg-blue-50/50 dark:bg-blue-950/20"
                          : "hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(id)}
                          className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0"
                        />
                      </td>

                      {/* Product */}
                      <td className="py-2.5 px-3">
                        <Link href={`/admin/products/${id}/edit`} className="flex items-center gap-2.5 group/name">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-9 h-9 rounded-lg object-contain bg-slate-50 dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-800 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-[180px]">
                            <p className="font-semibold text-slate-900 dark:text-white truncate group-hover/name:text-blue-600 dark:group-hover/name:text-blue-400 transition text-[12px]">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{product.brand || "Givolt"}</p>
                          </div>
                        </Link>
                      </td>

                      {/* SKU */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {product.sku}
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-medium whitespace-nowrap">
                          {product.category}
                        </span>
                      </td>

                      {/* Price - Inline Editable */}
                      <td className="py-2.5 px-3">
                        {isEditingPrice ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-medium">₹</span>
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleInlineEdit(product, "price", editValue);
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                              autoFocus
                              className="w-20 bg-white dark:bg-[#161c2b] border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                            />
                            <button onClick={() => handleInlineEdit(product, "price", editValue)} className="text-emerald-500 hover:text-emerald-400"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditingCell(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer group/price"
                            onClick={() => { setEditingCell({ id, field: "price" }); setEditValue(String(product.price)); }}
                          >
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                              ₹{product.price.toLocaleString("en-IN")}
                              <Pencil className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover/price:opacity-100 transition" />
                            </div>
                            {product.mrp && product.mrp > product.price && (
                              <div className="text-[10px] text-slate-400 line-through">
                                ₹{product.mrp.toLocaleString("en-IN")}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stock - Inline Editable */}
                      <td className="py-2.5 px-3">
                        {isEditingStock ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleInlineEdit(product, "stock", editValue);
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                              autoFocus
                              className="w-16 bg-white dark:bg-[#161c2b] border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                            />
                            <button onClick={() => handleInlineEdit(product, "stock", editValue)} className="text-emerald-500 hover:text-emerald-400"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditingCell(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <span
                            className={`cursor-pointer font-semibold flex items-center gap-1 group/stock ${
                              product.stock <= 0
                                ? "text-rose-600 dark:text-rose-400"
                                : product.stock <= (product.reorderLevel || 5)
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                            onClick={() => { setEditingCell({ id, field: "stock" }); setEditValue(String(product.stock)); }}
                          >
                            {product.stock}
                            <Pencil className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover/stock:opacity-100 transition" />
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <select
                          value={product.status}
                          onChange={(e) => handleInlineEdit(product, "status", e.target.value)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border cursor-pointer appearance-none bg-transparent focus:outline-none ${getStatusStyle(product.status)}`}
                        >
                          <option value="Active">Active</option>
                          <option value="Draft">Draft</option>
                          <option value="Out of Stock">Out of Stock</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </td>

                      {/* Featured Star */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Toggle featured"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              product.featured
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-0.5 relative">
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Preview"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/products/${id}/edit`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* More Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setContextMenu(contextMenu === id ? null : id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {contextMenu === id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setContextMenu(null)} />
                                <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl bg-white dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700 shadow-xl py-1 text-xs">
                                  <button
                                    onClick={() => { handleDuplicate(product); setContextMenu(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                                  >
                                    <Copy className="w-3.5 h-3.5" /> Duplicate
                                  </button>
                                  <button
                                    onClick={() => { handleToggleFeatured(product); setContextMenu(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                                  >
                                    <Star className="w-3.5 h-3.5" /> {product.featured ? "Unfeature" : "Feature"}
                                  </button>
                                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                                  <button
                                    onClick={() => { handleDelete(id, product.name); setContextMenu(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121826] text-xs text-slate-500 dark:text-slate-400">
          <span>
            Page <strong className="text-slate-900 dark:text-white">{page}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
            <span className="hidden sm:inline"> · {totalCount} products</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-white dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                    page === pageNum
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-white dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
