import React from "react";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import type { Metadata } from "next";
import "./admin-theme.css";

export const metadata: Metadata = {
  title: "Admin Panel | Givolt Electronics Management",
  description:
    "Enterprise e-commerce admin panel for managing electronics products, inventory, orders, customers, and pricing.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminThemeProvider>
  );
}
