"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface AdminThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (c: boolean) => void;
  toggleSidebar: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (o: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (o: boolean) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  toggleSidebar: () => {},
  mobileMenuOpen: false,
  setMobileMenuOpen: () => {},
  commandPaletteOpen: false,
  setCommandPaletteOpen: () => {},
});

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("givolt_admin_theme") as Theme | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        setThemeState("light");
      }

      const savedSidebar = localStorage.getItem("givolt_admin_sidebar_collapsed");
      if (savedSidebar !== null) {
        setSidebarCollapsedState(savedSidebar === "true");
      }
    } catch {
      // Ignore localStorage errors
    }
    setMounted(true);
  }, []);

  // Global keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("givolt_admin_theme", newTheme);
      document.documentElement.setAttribute("data-admin-theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem("givolt_admin_sidebar_collapsed", collapsed ? "true" : "false");
    } catch {
      // Ignore
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-admin-theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    }
  }, [theme, mounted]);

  return (
    <AdminThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        mobileMenuOpen,
        setMobileMenuOpen,
        commandPaletteOpen,
        setCommandPaletteOpen,
      }}
    >
      <div
        className={`admin-root admin-theme-${theme} ${theme === "light" ? "light" : "dark"} min-h-screen font-sans antialiased transition-colors duration-200`}
        data-theme={theme}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
