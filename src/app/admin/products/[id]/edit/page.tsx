export const dynamic = "force-dynamic";
import React, { Suspense } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { backendJson } from "@/lib/backend";
import type { IProduct } from "@/models/Product";
import { notFound } from "next/navigation";
import { RefreshCw } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function EditProductContent({ params }: PageProps) {
  const { id } = await params;
  const result = await backendJson<{ product: IProduct }>(`/api/admin/products/${encodeURIComponent(id)}`);
  const product = result?.product;

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
