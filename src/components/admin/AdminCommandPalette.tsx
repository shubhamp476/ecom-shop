"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Tag,
  Boxes,
  ShoppingCart,
  Users,
  Percent,
  Truck,
  BarChart3,
  History,
  Settings,
  Store,
  Sun,
  Moon,
  ArrowRight,
  ExternalLink,
  Command,
  X,
} from "lucide-react";
import { useAdminTheme } from "./AdminThemeProvider";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Navigation" | "Actions" | "Storefront";
  icon: any;
  href?: string;
  action?: () => void;
  keywords?: string[];
}

export default function AdminCommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, theme, toggleTheme } = useAdminTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: CommandItem[] = [
    // Navigation
    {
      id: "nav-dash",
      title: "Dashboard Overview",
      subtitle: "View key store metrics and recent activity",
      category: "Navigation",
      icon: LayoutDashboard,
      href: "/admin",
      keywords: ["home", "analytics", "stats", "overview"],
    },
    {
      id: "nav-products",
      title: "Products Catalog",
      subtitle: "Browse, filter, and manage catalog items",
      category: "Navigation",
      icon: Package,
      href: "/admin/products",
      keywords: ["items", "inventory", "hardware", "phones", "laptops"],
    },
    {
      id: "nav-add-product",
      title: "Add New Product",
      subtitle: "Create a new electronics product with variants",
      category: "Actions",
      icon: PlusCircle,
      href: "/admin/products/new",
      keywords: ["create", "new", "item"],
    },
    {
      id: "nav-categories",
      title: "Categories",
      subtitle: "Manage storefront categories & spec templates",
      category: "Navigation",
      icon: FolderTree,
      href: "/admin/categories",
      keywords: ["taxonomy", "smartphones", "audio", "gaming"],
    },
    {
      id: "nav-brands",
      title: "Brands & Manufacturers",
      subtitle: "Apple, Samsung, Sony, Bose, ASUS, etc.",
      category: "Navigation",
      icon: Tag,
      href: "/admin/brands",
      keywords: ["vendor", "manufacturer"],
    },
    {
      id: "nav-inventory",
      title: "Inventory & Stock Levels",
      subtitle: "Track low stock, reserved stock, and reorder levels",
      category: "Navigation",
      icon: Boxes,
      href: "/admin/inventory",
      keywords: ["stock", "warehouse", "reorder", "quantity"],
    },
    {
      id: "nav-orders",
      title: "Orders & Fulfillment",
      subtitle: "Track order status, customer payments, tracking",
      category: "Navigation",
      icon: ShoppingCart,
      href: "/admin/orders",
      keywords: ["sales", "customers", "shipping", "deliveries"],
    },
    {
      id: "nav-customers",
      title: "Customer Directory",
      subtitle: "Customer accounts, lifetime value, and order history",
      category: "Navigation",
      icon: Users,
      href: "/admin/customers",
      keywords: ["users", "clients", "buyers"],
    },
    {
      id: "nav-coupons",
      title: "Coupons & Discounts",
      subtitle: "Promotional codes, percentage discounts, minimum spend",
      category: "Navigation",
      icon: Percent,
      href: "/admin/coupons",
      keywords: ["promo", "discount", "voucher", "sale"],
    },
    {
      id: "nav-suppliers",
      title: "Suppliers & Vendors",
      subtitle: "Hardware distributors and supplier purchase agreements",
      category: "Navigation",
      icon: Truck,
      href: "/admin/suppliers",
      keywords: ["vendor", "distributor", "supply chain"],
    },
    {
      id: "nav-reports",
      title: "Analytics & Reports",
      subtitle: "Revenue trends, profit margins, and sales by category",
      category: "Navigation",
      icon: BarChart3,
      href: "/admin/reports",
      keywords: ["charts", "finance", "kpi", "margins"],
    },
    {
      id: "nav-logs",
      title: "System Audit Logs",
      subtitle: "Admin action history, logins, and inventory changes",
      category: "Navigation",
      icon: History,
      href: "/admin/logs",
      keywords: ["audit", "security", "activity"],
    },
    {
      id: "nav-settings",
      title: "Store Settings",
      subtitle: "Store details, tax GST, currency, and COD options",
      category: "Navigation",
      icon: Settings,
      href: "/admin/settings",
      keywords: ["configuration", "gst", "shipping", "policy"],
    },
    // Quick Actions
    {
      id: "action-theme",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      subtitle: "Toggle visual color theme of admin interface",
      category: "Actions",
      icon: theme === "dark" ? Sun : Moon,
      action: () => toggleTheme(),
      keywords: ["theme", "light", "dark", "color", "appearance"],
    },
    {
      id: "action-storefront",
      title: "Open Live Storefront",
      subtitle: "View the customer-facing Givolt tech store",
      category: "Storefront",
      icon: ExternalLink,
      action: () => window.open("/", "_blank"),
      keywords: ["shop", "storefront", "customer", "live"],
    },
  ];

  const filtered = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.keywords && item.keywords.some((k) => k.includes(q)))
    );
  });

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const handleSelect = (item: CommandItem) => {
    setCommandPaletteOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setCommandPaletteOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#0f1420] border border-slate-700/80 shadow-2xl shadow-black/50 overflow-hidden flex flex-col text-slate-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-[#161c2b]">
          <Search className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page name, or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching commands or pages found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium uppercase tracking-wider ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? "text-blue-100" : "text-slate-400"
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      isSelected ? "text-white" : "text-slate-600 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0b0f17] border-t border-slate-800 text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700">↑</kbd>{" "}
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700">↓</kbd> to
              navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↵</kbd> to
              select
            </span>
          </div>
          <span className="flex items-center gap-1 font-mono">Givolt Enterprise</span>
        </div>
      </div>
    </div>
  );
}
