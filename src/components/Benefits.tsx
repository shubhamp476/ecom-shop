"use client";

import React from "react";

export default function Benefits() {
  const benefits = [
    {
      icon: "/assets/69d4bef4a43dd9cbe074a60b_1.svg",
      title: "Free Shipping",
      desc: "No minimum order required. Get your tech delivered straight to your door, on us.",
    },
    {
      icon: "/assets/69d4bef4d091459c49e6a0a7_2.svg",
      title: "Secure Payment",
      desc: "Shop with confidence using encrypted, fraud-protected checkout your data stays safe.",
    },
    {
      icon: "/assets/69d4bef4bdbe90a5fabdf07f_3.svg",
      title: "Easy Returns",
      desc: "We value your satisfaction. Not satisfied? Return item in 7 days, no questions asked.",
    },
    {
      icon: "/assets/69d4bef45e2f7767e95e9e44_4.svg",
      title: "24/7 Support",
      desc: "Got a question at midnight? Our support team is always on, ready to help anytime.",
    },
  ];

  return (
    <section className="benefit-section pt-zero">
      <div className="w-layout-blockcontainer container w-container">
        <div className="section-title-box center">
          <div className="section-subtitle-box">
            <div className="section-subtitle-dot" />
            <p className="section-subtitle">Why We Stand Out</p>
          </div>
          <h2 className="section-title">Experience the Difference</h2>
          <p className="section-text">
            Experience the difference with quality you can see and service you can trust.
          </p>
        </div>
        <div className="w-layout-grid benefit-grid">
          {benefits.map((b) => (
            <div key={b.title} className="benefit-box">
              <div className="benefit-top-box">
                <img src={b.icon} alt="" className="benefit-icon" />
                <h3 className="benefit-title">{b.title}</h3>
              </div>
              <p className="benefit-text">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
