"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PRODUCTS, CATEGORIES, Category } from "@/data/products";

interface CategoryClientProps {
  category: Category;
  products?: typeof PRODUCTS;
}

export default function CategoryClient({ category, products }: CategoryClientProps) {
  const categoryProducts = products || PRODUCTS.filter((p) => p.categorySlug === category.slug);

  const [cartCount, setCartCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddToCart = (productName: string) => {
    setCartCount((prev) => prev + 1);
    setToastMessage(`Added "${productName}" to cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <div className="page-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1013] text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header / Navbar */}
      <Navbar cartCount={cartCount} />

      {/* Page Title Section */}
      <section className="page-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="page-content">
            <h2 className="page-title">{category.name}</h2>
          </div>
        </div>
      </section>

      {/* Product Section: Sidebar + 2-Column Product Grid */}
      <section className="product-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-grid category-two-grid">
            {/* Left Sidebar: Categories List */}
            <div id="w-node-_6df95b76-85fb-b549-fcd7-fc102f763eab-56e948a5" className="category-two-left-box">
              <h3 className="category-two-title">Categories</h3>
              <div className="w-dyn-list">
                <div role="list" className="w-dyn-items">
                  {CATEGORIES.map((cat) => {
                    const isCurrent = cat.slug === category.slug;
                    return (
                      <div role="listitem" className="w-dyn-item" key={cat.slug}>
                        <a
                          href={`/category/${cat.slug}`}
                          aria-current={isCurrent ? "page" : undefined}
                          className={`category-two-box w-inline-block ${isCurrent ? "w--current" : ""}`}
                        >
                          <div className="category-two-name">{cat.name}</div>
                          <div className="category-two-items">04 items</div>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Products Area: 2-column Grid */}
            <div className="category-two-right-box">
              <div className="w-dyn-list">
                <div role="list" className="cat-cms-two w-dyn-items">
                  {categoryProducts.map((product) => (
                    <div role="listitem" className="w-dyn-item" key={product.slug}>
                      <div className="new-product">
                        <a href={`/product/${product.slug}`} className="new-product-image-box w-inline-block">
                          <img
                            loading="lazy"
                            alt={product.name}
                            src={product.image}
                            className="product-image"
                          />
                        </a>
                        <div className="new-product-content">
                          <div className="new-product-title-box">
                            <img
                              src="/assets/6992c43f6ade0abf82fa71c8_star_star_star_star_star.svg"
                              loading="lazy"
                              alt="5 stars"
                              className="new-product-stars"
                            />
                            <a href={`/product/${product.slug}`} className="new-product-title-link w-inline-block">
                              <h3 className="new-product-title">{product.name}</h3>
                            </a>
                          </div>
                          <div className="product-price-box">
                            <p className="product-price">₹{product.price.toLocaleString("en-IN")}</p>
                            <div>
                              <button
                                type="button"
                                onClick={() => handleAddToCart(product.name)}
                                className="product-btn-two cursor-pointer border-none"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <Footer />
    </div>
  );
}
