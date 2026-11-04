export const dynamic = "force-dynamic";
import React from "react";
import { getAllProducts } from "@/lib/data-service";
import ShopClient from "./ShopClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products - Givolt Tech Store",
  description: "Browse our entire collection of cutting-edge electronics, gadgets, laptops, smartphones, and smart home tech.",
};

export default async function ShopPage() {
  const products = await getAllProducts();

  return <ShopClient products={products} />;
}
