"use client";

import React from "react";
import Link from "next/link";

export default function BlogSection() {
  const blogs = [
    {
      title: "Creating the Perfect Home Audio Setup on Any Budget",
      date: "Apr 3, 2026",
      readTime: "5 min read",
      image: "/assets/698981091f13eff2526fec5e_1.avif",
      href: "/shop",
    },
    {
      title: "Top 5 Smart Home Gadgets You Need in 2026",
      date: "Apr 3, 2026",
      readTime: "5 min read",
      image: "/assets/698980a496f56128c7e49ecf_2.avif",
      href: "/shop",
    },
    {
      title: "How to Choose the Perfect Gaming Setup on Any Budget",
      date: "Apr 3, 2026",
      readTime: "5 min read",
      image: "/assets/698980b4624326ab55c6b79d_3.avif",
      href: "/shop",
    },
  ];

  return (
    <section className="blog-section">
      <div className="w-layout-blockcontainer container w-container">
        {/* Header */}
        <div className="sectitle-wrapper">
          <div className="section-title-box mb-zero">
            <div className="section-subtitle-box">
              <div className="section-subtitle-dot" />
              <p className="section-subtitle">Tips and News</p>
            </div>
            <h2 className="section-title">Recent News and Resources</h2>
          </div>

          <div>
            <Link
              href="/shop"
              data-wf--primary-button--variant="base"
              className="primary-button w-inline-block"
            >
              <div className="primary-button-flex">
                <div className="primary-button-text-wrap">
                  <div className="primary-button-text">View All</div>
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

        {/* 3 Blog Cards */}
        <div className="w-dyn-list">
          <div role="list" className="blog-cms w-dyn-items">
            {blogs.map((b) => (
              <div key={b.title} role="listitem" className="w-dyn-item">
                <Link
                  href={b.href}
                  className="blog-box w-inline-block group transition-all duration-300 hover:shadow-lg"
                >
                  <div className="blog-image-box">
                    <img
                      src={b.image}
                      alt={b.title}
                      className="blog-image transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="bg image-overlay" />
                  </div>

                  <div className="blog-content">
                    <div className="blog-meta-box">
                      <p className="blog-meta">{b.date}</p>
                      <p className="blog-meta">-</p>
                      <p className="blog-meta">{b.readTime}</p>
                    </div>

                    <h3 className="blog-title">{b.title}</h3>

                    <div className="readmore">
                      <p className="readmore-text">Read More</p>
                      <div className="readmore-icon">
                        <img
                          src="/assets/6994053d91ecf5fdf079ca8d_right-arrow__6__1.svg"
                          alt=""
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
