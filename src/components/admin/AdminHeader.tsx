"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ShoppingCart,
  User,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  Menu,
  Command,
  ChevronDown,
  FolderPlus,
  Percent,
  Download,
  Check,
} from "lucide-react";
import { useAdminTheme } from "@/components/admin/AdminThemeProvider";

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    theme,
    toggleTheme,
    setMobileMenuOpen,
    setCommandPaletteOpen,
  } = useAdminTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);

  // Parse path breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, idx) => {
    const url = "/" + segments.slice(0, idx + 1).join("/");
    const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    return { url, label };
  });

  return (
    <>
      {/* Outside click dismiss backdrop for open dropdowns */}
      {(showQuickActions || showNotifications || showProfile) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowQuickActions(false);
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}

      <header
        style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap" }}
        className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0f1420]/90 backdrop-blur-md px-4 sm:px-6 text-slate-800 dark:text-slate-200 transition-colors"
      >
        {/* Left: Mobile Hamburger & Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition -ml-1 mr-1"
            title="Open Navigation"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 overflow-hidden">
            <Link
              href="/admin"
              className="hover:text-blue-600 dark:hover:text-white transition font-medium flex items-center gap-1 shrink-0"
            >
              <span>Admin</span>
            </Link>
            {breadcrumbs.slice(1).map((crumb, i) => (
              <React.Fragment key={crumb.url}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                <Link
                  href={crumb.url}
                  className={`hover:text-blue-600 dark:hover:text-white transition capitalize truncate max-w-[120px] sm:max-w-[180px] ${
                    i === breadcrumbs.length - 2 ? "text-slate-900 dark:text-white font-semibold" : ""
                  }`}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Center: Search Bar with Command Palette Trigger */}
        <div className="hidden md:flex items-center mx-3 flex-1 min-w-0 max-w-xs lg:max-w-sm">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="admin-search-btn w-full flex items-center justify-between bg-slate-100 dark:bg-[#161c2b] border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 transition group shadow-inner"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
              <span className="truncate">Search products, orders...</span>
            </span>
            <kbd className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0 ml-2">
              <Command className="w-3 h-3" /> K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Action Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowQuickActions(!showQuickActions);
                setShowNotifications(false);
                setShowProfile(false);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm shadow-blue-600/30 transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="w-3 h-3 opacity-80 shrink-0" />
            </button>

            {showQuickActions && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#151b2a] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Quick Actions
                </div>
                <Link
                  href="/admin/products/new"
                  onClick={() => setShowQuickActions(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Plus className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>New Product</span>
                </Link>
                <Link
                  href="/admin/categories"
                  onClick={() => setShowQuickActions(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <FolderPlus className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>New Category</span>
                </Link>
                <Link
                  href="/admin/coupons"
                  onClick={() => setShowQuickActions(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Percent className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Create Coupon</span>
                </Link>
                <a
                  href="/api/admin/export?type=products"
                  download
                  onClick={() => setShowQuickActions(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Download className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Export Products CSV</span>
                </a>
              </div>
            )}
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-center border border-slate-200 dark:border-slate-700/40 hover:border-slate-300 dark:hover:border-slate-600 shrink-0"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle admin color mode"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
                setShowQuickActions(false);
              }}
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition border border-slate-200 dark:border-slate-700/40 hover:border-slate-300 dark:hover:border-slate-600 shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {!notificationsRead && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#151b2a] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                  <span className="font-semibold text-slate-900 dark:text-white">Store Alerts & Activity</span>
                  <button
                    onClick={() => setNotificationsRead(true)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <Link
                    href="/admin/inventory"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Low Stock Alert: 2 Products</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Smart Door Lock & Sony PS5 Pro are running below safety threshold.
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">15 minutes ago</span>
                    </div>
                  </Link>

                  <Link
                    href="/admin/orders"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">New Order #GV-92812</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Ananya Iyer placed an order for 2x Mechanical Keyboards (₹18,999).
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">1 hour ago</span>
                    </div>
                  </Link>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    href="/admin/logs"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    View full activity log →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
                setShowQuickActions(false);
              }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 shrink-0"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                SA
              </div>
              <div className="hidden 2xl:block text-left text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block leading-tight truncate">
                  Admin User
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-medium">Super Admin</span>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#151b2a] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-white">Super Administrator</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">admin@givolt.store</p>
                  <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    Full Store Privileges
                  </span>
                </div>
                <div className="py-1">
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Store Settings</span>
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Live Storefront</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfile(false);
                      router.push("/admin/settings");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Session Options</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
