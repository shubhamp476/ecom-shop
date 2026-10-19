"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, ExternalLink, RefreshCw, CheckCircle, ShieldCheck } from "lucide-react";
import { IBrand } from "@/models/Brand";

function BrandLogo({ brand }: { brand: IBrand }) {
  const [imgError, setImgError] = useState(false);

  // Gradient accents for clean branded fallback badges
  const gradients: Record<string, string> = {
    samsung: "from-blue-600 to-indigo-700 text-white",
    apple: "from-slate-700 to-slate-900 text-white",
    sony: "from-zinc-800 to-black text-white",
    givolt: "from-blue-500 to-cyan-600 text-white",
    logitech: "from-teal-600 to-emerald-700 text-white",
  };

  const bgGradient =
    gradients[brand.slug?.toLowerCase()] ||
    "from-indigo-600 to-purple-700 text-white";

  if (!brand.logo || imgError) {
    return (
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bgGradient} flex items-center justify-center font-bold text-base shadow-sm shrink-0 select-none`}
        title={brand.name}
      >
        {brand.name ? brand.name.charAt(0).toUpperCase() : "B"}
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
      <img
        src={brand.logo}
        alt={brand.name}
        onError={() => setImgError(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("India");
  const [warrantyPolicy, setWarrantyPolicy] = useState("1 Year Official Brand Warranty");
  const [toast, setToast] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/brands");
      const json = await res.json();
      if (json.success) setBrands(json.brands);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          website,
          countryOfOrigin,
          warrantyPolicy,
          logo: "/assets/69d13b078880cdeb9b2b2fc9_2.avif",
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Brand "${name}" added.`);
        setName("");
        setWebsite("");
        setShowModal(false);
        fetchBrands();
      }
    } catch (e) {
      console.error(e);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-blue-500" />
            <span>Brand Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage authorized electronics manufacturers, warranty coverage policies, and partner relationships.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand</span>
        </button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="w-7 h-7 animate-spin text-blue-500 mx-auto mb-3" />
            <span className="font-medium text-sm">Loading brand directory...</span>
          </div>
        ) : (
          brands.map((brand) => (
            <div
              key={brand.slug}
              className="admin-brand-card p-5 rounded-2xl bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <BrandLogo brand={brand} />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {brand.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        {brand.countryOfOrigin || "Global"}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    {brand.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                  {brand.description || `Authorized electronics and accessories by ${brand.name}.`}
                </p>

                <div className="admin-warranty-box p-2.5 rounded-xl bg-slate-50 dark:bg-[#141a27] border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{brand.warrantyPolicy || "Standard Manufacturer Warranty"}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">{brand.productCount || 0} Products</span>
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-medium"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Brand Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Register New Brand</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asus ROG, Bose, Anker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Official Website</label>
                <input
                  type="url"
                  placeholder="https://brand.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Country of Origin</label>
                <input
                  type="text"
                  placeholder="e.g. Japan, USA, South Korea, India"
                  value={countryOfOrigin}
                  onChange={(e) => setCountryOfOrigin(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Warranty Coverage Terms</label>
                <input
                  type="text"
                  placeholder="e.g. 2 Years International Warranty"
                  value={warrantyPolicy}
                  onChange={(e) => setWarrantyPolicy(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#182032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
