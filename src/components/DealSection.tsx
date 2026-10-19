"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface DealProps {
  onAddToCart?: (title: string) => void;
}

export default function DealSection({ onAddToCart }: DealProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 24,
    seconds: 47,
  });

  useEffect(() => {
    const end = Date.now() + (3 * 86400 + 14 * 3600 + 24 * 60 + 47) * 1000;
    const interval = setInterval(() => {
      const diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const deals = [
    {
      id: "hd-smart-tv",
      title: "HD Smart TV",
      price: "₹44,999",
      oldPrice: "₹64,999",
      stock: "🔥 14 items in stock",
      image: "/assets/69e5d853770d85e89563d4c4_led.png",
      href: "/product/hd-smart-tv",
    },
    {
      id: "over-ear-headphones",
      title: "Over-Ear Headphones",
      price: "₹14,999",
      oldPrice: "₹19,999",
      stock: "🔥 14 items in stock",
      image: "/assets/69d4a8eeff34e3f332faf8cc_3.avif",
      href: "/product/over-ear-headphones",
    },
    {
      id: "mechanical-keyboard",
      title: "Mechanical Keyboard",
      price: "₹8,999",
      oldPrice: "₹12,999",
      stock: "🔥 14 items in stock",
      image: "/assets/69d4a94dcbcca23bde74e4e6_1.avif",
      href: "/product/mechanical-keyboard",
    },
  ];

  return (
    <section className="deal-section pb-zero">
      <div className="w-layout-blockcontainer container w-container">
        {/* Section Title Box */}
        <div className="section-title-box">
          <div className="section-subtitle-box">
            <div className="section-subtitle-dot" />
            <p className="section-subtitle">Limited Edition</p>
          </div>
          <h2 className="section-title">Exclusive Monthly Deals</h2>
          <p className="section-text">
            Limited-time offers updated every month — don't blink or you'll miss them.
          </p>
        </div>

        {/* 2-Column Deal Grid */}
        <div className="w-layout-grid deal-grid">
          {/* Left Column: Sticky Promo Card */}
          <div className="deal-offer-box">
            <div className="deal-offer">
              <img
                src="/assets/69d1423138afd7f32acf822b_Untitled_design__1_.avif"
                alt="Woman wearing VR headset"
                className="deal-offer-image"
                loading="lazy"
              />
              <div className="deal-offer-content">
                <div className="deal-subtitle-box">
                  <img
                    src="/assets/69899b4da3138ce8144b4c20__.png"
                    alt="Lightning"
                    className="deal-subtitle-icon"
                    loading="lazy"
                  />
                  <p className="deal-subtitle">Limited Edition</p>
                </div>
                <h3 className="deal-offer-title">Up to 40% Off</h3>
                <p className="deal-offer-text">
                  Upgrade your gear at special discounted prices.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Deal Cards */}
          <div className="deal-wrapper">
            <div className="w-dyn-list">
              <div role="list" className="w-dyn-items">
                {deals.map((deal) => (
                  <div key={deal.id} role="listitem" className="deal-cms w-dyn-item">
                    <div className="deal-product">
                      {/* Left Info */}
                      <div className="deal-content">
                        <div className="deal-product-title-box">
                          <p className="deal-product-stock">{deal.stock}</p>
                          <Link href={deal.href} className="deal-product-title-link w-inline-block">
                            <h4 className="deal-product-title">{deal.title}</h4>
                          </Link>
                          <div className="deal-product-price-box">
                            <p className="deal-product-price">{deal.price}</p>
                            <p className="deal-product-discount">{deal.oldPrice}</p>
                          </div>
                        </div>

                        {/* Countdown */}
                        <div className="deal-counter-wrap">
                          <p className="deal-counter-text-two">Hurry—offer ends soon!</p>
                          <div className="deal-counter-box">
                            <div className="deal-counter">
                              <p className="deal-count days">{String(timeLeft.days).padStart(2, "0")}</p>
                              <p className="deal-count-text">days</p>
                            </div>
                            <div className="deal-counter">
                              <p className="deal-count hours">{String(timeLeft.hours).padStart(2, "0")}</p>
                              <p className="deal-count-text">hours</p>
                            </div>
                            <div className="deal-counter">
                              <p className="deal-count minutes">{String(timeLeft.minutes).padStart(2, "0")}</p>
                              <p className="deal-count-text">mins</p>
                            </div>
                            <div className="deal-counter">
                              <p className="deal-count seconds">{String(timeLeft.seconds).padStart(2, "0")}</p>
                              <p className="deal-count-text">secs</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Image & Add to Cart */}
                      <div className="deal-image-box">
                        <div className="deal-shipping-box">
                          <div className="deal-shipping-dot" />
                          <p className="deal-shipping-text">Free Shipping &amp; Returns</p>
                        </div>
                        <Link href={deal.href} className="deal-image-link w-inline-block group">
                          <img
                            src={deal.image}
                            alt={deal.title}
                            className="deal-image transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onAddToCart && onAddToCart(deal.title)}
                          className="primary-button w-inline-block border-none cursor-pointer"
                        >
                          <div className="primary-button-flex">
                            <div className="primary-button-text-wrap">
                              <div className="primary-button-text">Add to Cart</div>
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
                        </button>
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
  );
}
