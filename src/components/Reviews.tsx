"use client";

import React, { useState } from "react";

export default function Reviews() {
  const [activeIdx, setActiveIdx] = useState(0);

  const reviews = [
    {
      name: "Sarah Moniqa",
      text: "I've been shopping here for two years and I'm never disappointed. Fast shipping, legit products, and the deals are unbeatable.",
      avatar: "/assets/69898fecd179a8ca234c74ae_1.avif",
      alt: "Smiling middle-aged man with gray hair and beard wearing a peach-colored shirt",
    },
    {
      name: "Aitana Bonmati",
      text: "Finally a tech store that curates things properly. I don't feel overwhelmed — I just find what I need and check out.",
      avatar: "/assets/69899057c26b86173482a213_2.avif",
      alt: "Confident woman with medium-length dark hair wearing a white blazer",
    },
    {
      name: "Marcos Llorente",
      text: "Ordered a smart home bundle on a Tuesday and it was at my door by Thursday. Absolutely love the quality.",
      avatar: "/assets/69899058d9925aeeb8d35223_3.avif",
      alt: "Older man with gray hair and glasses wearing a dark jacket",
    },
    {
      name: "Tara Johnson",
      text: "I recently bought a new gaming headset and laptop from this store, and I’m really impressed. The products are genuine, and the quality exceeded my expectations.",
      avatar: "/assets/69899058f6731e174b9e2fec_4.avif",
      alt: "Woman with curly hair wearing a black blazer and white top",
    },
    {
      name: "Pablo Gavi",
      text: "This electronics shop is my go-to for all tech needs. They have a wide selection of the latest gadgets, and their discounts are amazing.",
      avatar: "/assets/69899057da2a261a312e8a82_5.avif",
      alt: "Portrait of a young man with dark hair and beard wearing a blue shirt",
    },
    {
      name: "Lana Cameron",
      text: "Shopping here was such a smooth experience. From browsing the products online to placing the order and receiving it in perfect condition.",
      avatar: "/assets/6989905871d333bebb3ab7a0_6.avif",
      alt: "Smiling woman with curly brown hair wearing a pink top",
    },
  ];

  return (
    <section className="reviews-sectin">
      <div className="review-wrapper">
        <div className="w-layout-blockcontainer container w-container">
          <div className="section-title-box center">
            <div className="section-subtitle-box">
              <div className="section-subtitle-dot" />
              <p className="section-subtitle">Real People. Real Reviews.</p>
            </div>
            <h2 className="section-title">What Our Customers Are Saying</h2>
          </div>
        </div>

        <div className="review-tabs w-tabs">
          <div className="review-tabs-content w-tab-content">
            <div className="review-tab-pane w-tab-pane w--tab-active text-center">
              <div className="review-box">
                <img
                  src="/assets/698990c596d02ec3155882a2_starstarstarstarstar.png"
                  alt="5 stars rating"
                  className="review-rating inline-block mx-auto"
                />
                <p className="review-text">"{reviews[activeIdx].text}"</p>
                <p className="review-name">— {reviews[activeIdx].name}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <div className="review-tabs-menu w-tab-menu" role="tablist">
              {reviews.map((r, idx) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`review-tab-link w-inline-block w-tab-link border-none bg-transparent cursor-pointer p-0 ${
                    activeIdx === idx ? "w--current" : ""
                  }`}
                  aria-label={r.name}
                >
                  <div className="review-image-box">
                    <img
                      src={r.avatar}
                      alt={r.alt}
                      className="review-image"
                      loading="lazy"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
