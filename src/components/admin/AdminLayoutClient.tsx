"use client";

import React, { Suspense } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminCommandPalette from "./AdminCommandPalette";
import { useAdminTheme } from "./AdminThemeProvider";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useAdminTheme();

  return (
    <div className="admin-layout-root min-h-screen flex font-sans antialiased relative">
      {/* Sidebar Navigation */}
      <Suspense fallback={<aside className="hidden lg:block w-64 border-r border-slate-800 bg-slate-950" />}>
        <AdminSidebar />
      </Suspense>

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-h-screen w-full ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        } pl-0`}
      >
        <Suspense fallback={<header className="h-16 border-b border-slate-800 bg-slate-950/80" />}>
          <AdminHeader />
        </Suspense>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        
        {/* Systematic System Footer */}
        <footer className="border-t border-slate-800/60 py-4 px-6 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-400">Givolt Enterprise Core v2.4</span>
            <span>•</span>
            <span>Database: Active</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">Press ⌘K for Command Palette</span>
            <span>Security: Verified</span>
          </div>
        </footer>
      </div>

      {/* Command Palette (⌘K) */}
      <Suspense fallback={null}>
        <AdminCommandPalette />
      </Suspense>
    </div>
  );
}
