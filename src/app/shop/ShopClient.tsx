"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ShopClientProps {
  products: Product[];
}

export default function ShopClient({ products }: ShopClientProps) {
  const cart = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddToCart = (product: Product) => {
    cart.addToCart(product, 1);
    setToastMessage(`Added "${product.name}" to cart!`);
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
      <Navbar />

      {/* Title Section */}
      <section className="page-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="page-content">
            <h1 className="page-title">Discover Products That Combine Style and Value</h1>
          </div>
        </div>
      </section>

      {/* Product Section: 4-Column Grid */}
      <section className="product-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-dyn-list">
            <div role="list" className="cat-cms w-dyn-items">
              {products.map((product) => (
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
                            onClick={() => handleAddToCart(product)}
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
      </section>

      {/* Main Footer */}
      <Footer />
    </div>
  );
}
