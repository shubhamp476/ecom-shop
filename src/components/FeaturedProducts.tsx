"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface FeaturedProps {
  onAddToCart?: (title: string) => void;
}

export default function FeaturedProducts({ onAddToCart }: FeaturedProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const [products, setProducts] = useState<{ title: string; price: string; image: string; href: string }[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const dynamic = json.data.slice(0, 6).map((p: any) => ({
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

  const totalPages = Math.max(1, Math.ceil(products.length / 3));

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="product-section">
      {loadError && <p role="status" style={{ textAlign: "center" }}>Products are temporarily unavailable.</p>}
      <div className="w-layout-blockcontainer container w-container">
        {/* Section Header */}
        <div className="section-title-box center">
          <div className="section-subtitle-box">
            <div className="section-subtitle-dot" />
            <p className="section-subtitle">Best Sellers Right Now</p>
          </div>
          <h2 className="section-title">Top Picks Loved by Customers</h2>
          <p className="section-text">
            Our most popular products, chosen by customers for their quality, performance, and value.
          </p>
        </div>

        {/* Product Slider */}
        <div className="product-slider w-slider relative">
          <div className="product-mask w-slider-mask overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentPage * 100}%)`,
              }}
            >
              {Array.from({ length: totalPages }).map((_, pageIdx) => {
                const pageProducts = products.slice(pageIdx * 3, pageIdx * 3 + 3);
                return (
                  <div key={pageIdx} className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pageProducts.map((p) => (
                      <div key={p.title} className="w-dyn-item">
                        <Link
                          href={p.href}
                          className="new-product w-inline-block group transition-all duration-300 hover:shadow-lg"
                        >
                          <div className="new-product-image-box two">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="product-image transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                          <div className="new-product-content">
                            <div className="new-product-title-box">
                              <img
                                src="/assets/6992c43f6ade0abf82fa71c8_star_star_star_star_star.svg"
                                alt="5 stars"
                                className="new-product-stars"
                                loading="lazy"
                              />
                              <h3 className="new-product-title">{p.title}</h3>
                            </div>
                            <div className="product-price-box">
                              <p className="product-price">{p.price}</p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slider Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            className="product-arrow left w-slider-arrow-left cursor-pointer border-none shadow-md hover:bg-neutral-100 transition-colors hidden md:flex"
            aria-label="previous slide"
          >
            <img
              src="/assets/6992ea01efc436bbf35b439d_1.svg"
              alt="Previous"
              className="product-arrow-icon"
            />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="product-arrow right w-slider-arrow-right cursor-pointer border-none shadow-md hover:bg-neutral-100 transition-colors hidden md:flex"
            aria-label="next slide"
          >
            <img
              src="/assets/6992ea05f815a4ca452c9b82_2.svg"
              alt="Next"
              className="product-arrow-icon"
            />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentPage(dotIdx)}
                className={`transition-all duration-300 rounded-full cursor-pointer h-2 ${
                  currentPage === dotIdx
                    ? "w-6 bg-[#2563eb]"
                    : "w-3 bg-neutral-300 hover:bg-neutral-400"
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
