"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NewArrivalsProps {
  onAddToCart?: (title: string) => void;
}

export default function NewArrivals({ onAddToCart }: NewArrivalsProps) {
  const [products, setProducts] = useState<{ title: string; price: string; image: string; href: string }[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const dynamic = json.data.slice(0, 8).map((p: any) => ({
            title: p.name,
            price: `₹${p.price.toLocaleString("en-IN")}`,
            image: p.image,
            href: `/product/${p.slug}`,
          }));
          setProducts(dynamic);
        } else { setLoadError(true); }
      })
      .catch(() => setLoadError(true));
  }, []);

  return (
    <section className="product-section pb-zero">
      {loadError && <p role="status" style={{ textAlign: "center" }}>Products are temporarily unavailable.</p>}
      <div className="w-layout-blockcontainer container w-container">
        {/* Section Header */}
        <div className="sectitle-wrapper">
          <div className="section-title-box mb-zero">
            <div className="section-subtitle-box">
              <div className="section-subtitle-dot" />
              <p className="section-subtitle">Just Landed</p>
            </div>
            <h2 className="section-title">Fresh Innovations, Just Arrived</h2>
            <p className="section-text">
              Collection, designed to deliver exceptional performance, modern style.
            </p>
          </div>

          <div>
            <Link
              href="/shop"
              data-wf--primary-button--variant="colored"
              className="primary-button w-variant-ad348b8b-4f15-fb28-f905-49b9ee248ed7 w-inline-block"
            >
              <div className="primary-button-flex">
                <div className="primary-button-text-wrap">
                  <div className="primary-button-text">View All Products</div>
                </div>
                <div className="primary-button-arrow-box">
                  <img
                    src="/assets/69cf6734573934bf5a71c0be_right-arrow__6__1.svg"
                    alt=""
                    className="primary-button-arrow"
                    loading="lazy"
                  />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* 8 Products (4x2 Grid) using .product-cms-two */}
        <div className="w-dyn-list">
          <div role="list" className="product-cms-two w-dyn-items">
            {products.map((p) => (
              <div key={p.title} role="listitem" className="w-dyn-item">
                <div className="new-product group transition-all duration-300 hover:shadow-lg">
                  <Link href={p.href} className="new-product-image-box w-inline-block">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="product-image transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>

                  <div className="new-product-content">
                    <div className="new-product-title-box">
                      <img
                        src="/assets/6992c43f6ade0abf82fa71c8_star_star_star_star_star.svg"
                        alt="5 stars"
                        className="new-product-stars"
                        loading="lazy"
                      />
                      <Link href={p.href} className="new-product-title-link w-inline-block">
                        <h3 className="new-product-title">{p.title}</h3>
                      </Link>
                    </div>

                    <div className="product-price-box">
                      <p className="product-price">{p.price}</p>
                      <div>
                        <button
                          type="button"
                          onClick={() => onAddToCart && onAddToCart(p.title)}
                          className="w-commerce-commerceaddtocartbutton product-btn-two cursor-pointer border-none bg-transparent hover:opacity-80 transition-opacity"
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
  );
}
