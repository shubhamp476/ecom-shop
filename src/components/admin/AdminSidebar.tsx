"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Tag,
  DollarSign,
  Boxes,
  Truck,
  ShoppingCart,
  Users,
  Percent,
  BarChart3,
  FileSpreadsheet,
  History,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
  Cpu,
  X,
  ExternalLink,
} from "lucide-react";
import { useAdminTheme } from "./AdminThemeProvider";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useAdminTheme();

  const navigation: NavGroup[] = [
    {
      group: "Overview",
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      group: "Catalog",
      items: [
        { name: "Products", href: "/admin/products", icon: Package },
        { name: "Add Product", href: "/admin/products/new", icon: PlusCircle },
        { name: "Categories", href: "/admin/categories", icon: FolderTree },
        { name: "Brands", href: "/admin/brands", icon: Tag },
        { name: "Pricing", href: "/admin/pricing", icon: DollarSign },
      ],
    },
    {
      group: "Inventory & Logistics",
      items: [
        {
          name: "Inventory",
          href: "/admin/inventory",
          icon: Boxes,
          badge: "Low",
          badgeColor: "bg-amber-500/20 text-amber-400",
        },
        { name: "Suppliers", href: "/admin/suppliers", icon: Truck },
      ],
    },
    {
      group: "Sales & Customers",
      items: [
        {
          name: "Orders",
          href: "/admin/orders",
          icon: ShoppingCart,
          badge: "4 New",
          badgeColor: "bg-blue-500/20 text-blue-400",
        },
        { name: "Customers", href: "/admin/customers", icon: Users },
        { name: "Coupons", href: "/admin/coupons", icon: Percent },
      ],
    },
    {
      group: "Operations",
      items: [
        { name: "Reports", href: "/admin/reports", icon: BarChart3 },
        { name: "Import / Export", href: "/admin/import-export", icon: FileSpreadsheet },
        { name: "Activity Logs", href: "/admin/logs", icon: History },
        { name: "Store Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar Component */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col bg-white dark:bg-[#0c1019] border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 select-none shadow-xl lg:shadow-none ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        } w-64 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726]">
          {(!sidebarCollapsed || mobileMenuOpen) ? (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight block truncate">
                  Givolt Admin
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Electronics Store
                </span>
              </div>
            </Link>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Cpu className="w-5 h-5" />
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {navigation.map((group) => (
            <div key={group.group}>
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 mb-2 select-none">
                  {group.group}
                </div>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`admin-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                          isActive
                            ? "active bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                            : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
                        } ${
                          sidebarCollapsed && !mobileMenuOpen ? "justify-center" : ""
                        }`}
                        title={sidebarCollapsed && !mobileMenuOpen ? item.name : undefined}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-transform ${
                            isActive
                              ? "text-white scale-110"
                              : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-white group-hover:scale-110"
                          }`}
                        />
                        {(!sidebarCollapsed || mobileMenuOpen) && (
                          <span className="truncate">{item.name}</span>
                        )}

                        {(!sidebarCollapsed || mobileMenuOpen) && item.badge && (
                          <span
                            className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isActive
                                ? "bg-white/25 text-white"
                                : item.badgeColor || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {sidebarCollapsed && !mobileMenuOpen && item.badge && (
                          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Storefront Link */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#111726]">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition border border-emerald-200 dark:border-emerald-800/40 ${
              sidebarCollapsed && !mobileMenuOpen ? "justify-center" : ""
            }`}
            title="Open live customer storefront"
          >
            <Store className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <span className="flex-1 truncate">View Storefront</span>
            )}
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
