"use client";

import React from "react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-wrapper">
        <div className="hero-content">
          <h1 className="hero-title">Upgrade Your Everyday Tech Experience</h1>
          <p className="hero-text">
            Discover thoughtfully designed gadgets that blend innovation, performance, and style — built to elevate how you live, work, and play.
          </p>
          <div className="hero-btn-box">
            <Link
              href="/shop"
              className="primary-button w-variant-ad348b8b-4f15-fb28-f905-49b9ee248ed7 w-inline-block"
            >
              <div className="primary-button-flex">
                <div className="primary-button-text-wrap">
                  <div className="primary-button-text">Shop the Collection</div>
                  <div className="primary-button-text-hover">Shop the Collection</div>
                </div>
                <div className="primary-button-arrow-wrapper">
                  <div className="primary-button-arrow-wrap">
                    <img
                      src="/assets/69cf6734573934bf5a71c0be_right-arrow__6__1.svg"
                      alt=""
                      className="primary-button-arrow"
                    />
                    <img
                      src="/assets/69cf6734573934bf5a71c0be_right-arrow__6__1.svg"
                      alt=""
                      className="primary-button-arrow-hover"
                    />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* 5 Floating Arched Hero Image Cards matching Webflow 1:1 */}
        <div className="hero-image-outer">
          <div className="hero-images-wrapper">
            <div className="hero-image-box _1">
              <img
                src="/assets/69d0d7e534958c9430e862c7_12.avif"
                loading="lazy"
                alt="White smartwatch"
                className="hero-image"
              />
              <div className="bg image-overlay" />
            </div>

            <div className="hero-image-box _2">
              <img
                src="/assets/69d0d7e24e588b0477927886_9.avif"
                loading="lazy"
                alt="Black cylindrical smart speaker"
                className="hero-image"
              />
              <div className="bg image-overlay" />
            </div>

            <div className="hero-image-box _3">
              <img
                src="/assets/69d1303373bd667cc6ad4bb3_7.avif"
                loading="lazy"
                alt="Woman wearing VR headset"
                className="hero-image main"
              />
              <div className="bg image-overlay" />
            </div>

            <div className="hero-image-box _4">
              <img
                src="/assets/698976f7057d16cc18b94049_4.avif"
                loading="lazy"
                alt="Gray cylindrical smart speaker"
                className="hero-image"
              />
              <div className="bg image-overlay" />
            </div>

            <div className="hero-image-box _5">
              <img
                src="/assets/69d0d7e0dea65fbb0819441a_6.avif"
                loading="lazy"
                alt="Black over-ear headphones"
                className="hero-image"
              />
              <div className="bg image-overlay" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
