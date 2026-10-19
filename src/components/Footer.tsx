"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <footer className="main-footer">
      <div className="footer-widgets">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-grid footer-grid">
            {/* Newsletter Col */}
            <div className="footer-title-box">
              <h3 className="footer-title">
                Get Exclusive Deals Before Anyone Else
              </h3>
              <p className="footer-text">
                Sign up today and receive early access to discounts, limited offers, and insider updates.
              </p>
              <div className="newsletter-form-block w-form">
                <form onSubmit={handleSubmit} className="newsletter-form">
                  <input
                    className="newsletter-input w-input"
                    maxLength={256}
                    name="email"
                    placeholder="Enter your email."
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="submit"
                    className="primary-button newsletter-btn w-button cursor-pointer"
                    value={submitted ? "Subscribed!" : "Get Access"}
                  />
                </form>
              </div>
            </div>

            {/* Links Columns */}
            <div className="footer-links-wrap">
              <div>
                <h6 className="footer-title-two">Categories</h6>
                <div className="footer-links-box">
                  <Link href="/" className="footer-link w--current">Home</Link>
                  <Link href="/about-us" className="footer-link">About Us</Link>
                  <Link href="/category" className="footer-link">Collection</Link>
                  <Link href="/shop" className="footer-link">Shop</Link>
                  <Link href="/contact" className="footer-link">Contact</Link>
                </div>
              </div>

              <div>
                <h6 className="footer-title-two">Links</h6>
                <div className="w-dyn-list">
                  <div role="list" className="w-dyn-items">
                    <div role="listitem" className="w-dyn-item">
                      <Link href="/category/smartphones" className="footer-link">Smartphones</Link>
                    </div>
                    <div role="listitem" className="w-dyn-item">
                      <Link href="/category/laptops" className="footer-link">Laptops</Link>
                    </div>
                    <div role="listitem" className="w-dyn-item">
                      <Link href="/category/smart-home" className="footer-link">Smart Home</Link>
                    </div>
                    <div role="listitem" className="w-dyn-item">
                      <Link href="/category/audio-sounds" className="footer-link">Audio &amp; Sounds</Link>
                    </div>
                    <div role="listitem" className="w-dyn-item">
                      <Link href="/category/gaming-gadgets" className="footer-link">Gaming Gadgets</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="footer-title-two">Utility Pages</h6>
                <div className="footer-links-box">
                  <Link href="/utility-pages/license" className="footer-link">License</Link>
                  <Link href="/utility-pages/changelog" className="footer-link">Changelog</Link>
                  <Link href="/utility-pages/style-guide" className="footer-link">Style Guide</Link>
                  <Link href="/404" className="footer-link">404 Not Found</Link>
                  <Link href="/401" className="footer-link">Protected Password</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="w-layout-blockcontainer container w-container">
          <div className="footer-bottom-inner">
            <div className="copyright-box">
              <Link href="/" className="w-inline-block w--current">
                <img
                  loading="lazy"
                  src="/assets/69cfa684789fe8d974b2bca8_Givolt..svg"
                  alt="Givolt logo"
                />
              </Link>
              <div className="copyright-line" />
              <p className="copyright-text">
                © Copyright - <Link href="/" className="copyright-text-link">Givlot</Link> | Designed by <a href="https://webflow.com/templates/designers/skyeflow" target="_blank" rel="noopener noreferrer" className="copyright-text-link">Skyeflow</a> - License Powered by <a href="https://webflow.com/" target="_blank" rel="noopener noreferrer" className="copyright-text-link">Webflow</a>
              </p>
            </div>

            <div className="footer-social-box">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="footer-social w-inline-block" aria-label="Facebook">
                <img loading="lazy" src="/assets/69969e280586c4a4a900c548_1.svg" alt="Facebook" className="footer-social-icon" />
              </a>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="footer-social w-inline-block" aria-label="X">
                <img loading="lazy" src="/assets/69969e2845dfd4faac2ce0e3_2.svg" alt="X" className="footer-social-icon" />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="footer-social w-inline-block" aria-label="LinkedIn">
                <img loading="lazy" src="/assets/69969e28dbe79657e2f510c7_3.svg" alt="LinkedIn" className="footer-social-icon" />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="footer-social w-inline-block" aria-label="Instagram">
                <img loading="lazy" src="/assets/69969e2868879ee03dd9660f_4.svg" alt="Instagram" className="footer-social-icon" />
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="footer-social w-inline-block" aria-label="YouTube">
                <img loading="lazy" src="/assets/69969e296dca1183fd217937_6.svg" alt="YouTube" className="footer-social-icon" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
