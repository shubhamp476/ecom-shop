"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Boxes,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";

export default function AdminImportExportPage() {
  const [csvText, setCsvText] = useState(
    `SKU,Name,Category,Price,Stock\nGV-SMA-9901,OnePlus 12 5G,Smartphones,799.99,15\nGV-LAP-9902,ThinkPad X1 Carbon Gen 11,Laptops,1399.99,8\nGV-AUD-9903,Sony WH-1000XM5,Audio & Sounds,349.99,20`
  );
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleValidate = async () => {
    try {
      setValidating(true);
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: csvText, commit: false }),
      });
      const json = await res.json();
      setImportResult(json);
      if (json.success) {
        showToast(`Parsed ${json.validCount} valid products.`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setValidating(false);
    }
  };

  const handleCommit = async () => {
    try {
      setCommitting(true);
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: csvText, commit: true }),
      });
      const json = await res.json();
      setImportResult(json);
      if (json.success) {
        showToast(`Successfully imported ${json.validCount} products into database!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
            <span>CSV Import & Export Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bulk synchronize electronics catalog, batch inventory updates, and download warehouse records.
          </p>
        </div>
      </div>

      {/* 1. Quick Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f1420] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Product Catalog CSV</h3>
              <p className="text-[11px] text-slate-400">SKUs, titles, MRPs, selling prices, status</p>
            </div>
          </div>
          <a
            href="/api/admin/export?type=products"
            download
            className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Products CSV</span>
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1420] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Inventory Levels CSV</h3>
              <p className="text-[11px] text-slate-400">Warehouse stock, reserved, and reorder levels</p>
            </div>
          </div>
          <a
            href="/api/admin/export?type=inventory"
            download
            className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Inventory CSV</span>
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1420] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Orders Export CSV</h3>
              <p className="text-[11px] text-slate-400">Customer transactions and delivery states</p>
            </div>
          </div>
          <a
            href="/api/admin/export?type=orders"
            download
            className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Orders CSV</span>
          </a>
        </div>
      </div>

      {/* 2. CSV Import Workspace */}
      <div className="p-6 rounded-2xl bg-[#0f1420] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Import Products via CSV
            </h2>
            <p className="text-xs text-slate-400">
              Paste or upload comma-separated records. Required columns: <code>SKU</code>, <code>Name</code>, <code>Category</code>, <code>Price</code>, <code>Stock</code>.
            </p>
          </div>
          <button
            onClick={() =>
              setCsvText(
                "SKU,Name,Category,Price,Stock\nGV-GAM-2001,Razer DeathAdder V3,Gaming Gadgets,69.99,25\nGV-SMA-2002,Google Pixel 8 Pro,Smartphones,899.99,10"
              )
            }
            className="text-xs text-blue-400 hover:underline self-start"
          >
            Load Sample Template
          </button>
        </div>

        <textarea
          rows={6}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full bg-[#161c2b] border border-slate-700 rounded-xl p-3 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleValidate}
            disabled={validating}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
          >
            {validating ? "Validating..." : "Validate CSV Rows"}
          </button>
          <button
            type="button"
            onClick={handleCommit}
            disabled={committing || !importResult?.validCount}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{committing ? "Importing..." : "Commit Import to Store"}</span>
          </button>
        </div>

        {/* Validation Preview Table */}
        {importResult && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-white">Validation Results:</span>
              <span className="text-emerald-400 font-semibold">{importResult.validCount} Valid Rows</span>
              {importResult.errorCount > 0 && (
                <span className="text-rose-400 font-semibold">{importResult.errorCount} Invalid / Skipped Rows</span>
              )}
            </div>

            {importResult.validRows && importResult.validRows.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121826] text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Price (₹)</th>
                      <th className="py-2.5 px-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#161c2b]">
                    {importResult.validRows.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-300">{r.sku}</td>
                        <td className="py-2 px-3 font-semibold text-white">{r.name}</td>
                        <td className="py-2 px-3 text-slate-400">{r.category}</td>
                        <td className="py-2 px-3 font-bold text-emerald-400">₹{Number(r.price).toLocaleString("en-IN")}</td>
                        <td className="py-2 px-3 text-slate-300">{r.stock} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
