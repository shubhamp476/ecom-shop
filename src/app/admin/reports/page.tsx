"use client";

import { useEffect, useState } from "react";
import { BarChart3, Download, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type CategoryReport = { _id: string; productCount: number; totalStock: number; inventoryValue: number };
type BrandReport = { _id: string; productCount: number; minimumPrice: number; maximumPrice: number; averagePrice: number };
type Report = { categories: CategoryReport[]; brands: BrandReport[]; lowStock: { _id: string; name: string; stock: number }[] };
export default function AdminReportsPage() {
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/admin/reports/inventory").then(async (r) => {
      const json = await r.json();
      if (!r.ok || !json.success) throw new Error(json.error || "Unable to load inventory report");
      setData(json);
    }).catch((e) => setError(e.message));
  }, []);
  if (error) return <p role="alert" className="p-6 text-red-500">{error}</p>;
  if (!data) return <div className="flex justify-center p-20"><RefreshCw className="animate-spin" /></div>;
  const panel = "p-6 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800";
  return <div className="space-y-6 text-slate-900 dark:text-white">
    <div className="flex justify-between items-center gap-4">
      <div><h1 className="text-2xl font-bold flex gap-2"><BarChart3 /> Inventory Reports</h1><p className="text-sm text-slate-500 mt-2">Current category totals, brand prices, and low stock from the product catalog.</p></div>
      <a href="/api/admin/export?type=inventory" className="flex gap-2 text-sm"><Download size={18} />Export CSV</a>
    </div>
    <div className="grid sm:grid-cols-3 gap-4">
      {[['Products', data.categories.reduce((n,c)=>n+c.productCount,0)], ['Units in stock',data.categories.reduce((n,c)=>n+c.totalStock,0)], ['Low stock products',data.lowStock.length]].map(([label,value])=><div className={panel} key={label}><p className="text-sm text-slate-500">{label}</p><p className="text-3xl font-bold mt-2">{value}</p></div>)}
    </div>
    <section className={panel}><h2 className="font-semibold mb-4">Inventory value by category (₹)</h2>
      {data.categories.length ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.categories}><XAxis dataKey="_id" /><YAxis width={80} tickFormatter={(value: number) => value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)} /><Tooltip /><Bar dataKey="inventoryValue" fill="#3b82f6" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div> : <p>No products yet.</p>}
    </section>
    <section className={panel}><h2 className="font-semibold mb-4">Category summary</h2><div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th>Category</th><th>Products</th><th>Stock</th><th>Value (₹)</th></tr></thead><tbody>{data.categories.map(c=><tr key={c._id} className="border-t border-slate-200 dark:border-slate-800"><td className="py-3">{c._id}</td><td>{c.productCount}</td><td>{c.totalStock}</td><td>{c.inventoryValue.toLocaleString('en-IN')}</td></tr>)}</tbody></table></div></section>
    <section className={panel}><h2 className="font-semibold mb-4">Brand price summary (₹)</h2><div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th>Brand</th><th>Products</th><th>Minimum</th><th>Maximum</th><th>Average</th></tr></thead><tbody>{data.brands.map(b=><tr key={b._id} className="border-t border-slate-200 dark:border-slate-800"><td className="py-3">{b._id}</td><td>{b.productCount}</td><td>{b.minimumPrice}</td><td>{b.maximumPrice}</td><td>{b.averagePrice.toFixed(2)}</td></tr>)}</tbody></table></div></section>
    <section className={panel}><h2 className="font-semibold mb-4">Low stock: 10 units or fewer</h2>{data.lowStock.length ? data.lowStock.map(p=><div key={p._id} className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800"><span>{p.name}</span><strong>{p.stock}</strong></div>) : <p>No low stock products.</p>}</section>
  </div>;
}
