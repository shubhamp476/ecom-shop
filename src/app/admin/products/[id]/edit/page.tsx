import React, { Suspense } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { adminStore } from "@/lib/admin-store";
import { notFound } from "next/navigation";
import { RefreshCw } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function EditProductContent({ params }: PageProps) {
  const { id } = await params;
  let product: any = null;

  try {
    const { connectToDatabase } = await import("@/lib/mongodb");
    const { Product } = await import("@/models/Product");
    const conn = await connectToDatabase();
    if (conn) {
      const dbProduct = await Product.findOne({
        $or: [{ _id: id }, { id: id }, { slug: id }, { sku: id }],
      }).lean();
      if (dbProduct) {
        product = JSON.parse(JSON.stringify(dbProduct));
      }
    }
  } catch (e) {
    // Fall back to in-memory store
  }

  if (!product) {
    product = adminStore.products.find(
      (p) => p.id === id || p._id === id || p.slug === id || p.sku === id
    );
  }

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} isEdit={true} productId={id} />;
}

export default function EditProductPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      }
    >
      <EditProductContent params={params} />
    </Suspense>
  );
}
