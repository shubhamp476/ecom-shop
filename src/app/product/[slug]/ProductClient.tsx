"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PRODUCTS, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ProductClientProps {
  product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
  const router = useRouter();
  const cart = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Related products (4 products from other categories or same)
  const relatedProducts = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4);

  const handleAddToCart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    cart.addToCart(product, quantity);
    setToastMessage(`Added ${quantity}x "${product.name}" to cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    cart.addToCart(product, quantity);
    router.push("/checkout");
  };

  const handleAddRelatedToCart = (pName: string) => {
    const rel = PRODUCTS.find((p) => p.name === pName);
    cart.addToCart(rel || { name: pName, price: 1999 }, 1);
    setToastMessage(`Added "${pName}" to cart!`);
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

      {/* Product Detail Section */}
      <section className="product-detail pb-zero">
        <div className="w-layout-blockcontainer container w-container">
          <div className="product-detail-box">
            {/* Left Column: Product Image */}
            <div id="w-node-aee20916-58a4-ae1d-0a7d-2695c159a4c0-56e948b3" className="product-detail-image-box">
              <img
                loading="lazy"
                src={product.image}
                alt={product.name}
                className="product-detail-image"
              />
            </div>

            {/* Right Column: Product Content Box */}
            <div className="product-detail-content-box">
              <div className="product-detail-content">
                <div className="product-detail-title-box">
                  <img
                    src="/assets/6992c43f6ade0abf82fa71c8_star_star_star_star_star.svg"
                    loading="lazy"
                    alt="5 stars"
                    className="product-detail-stars"
                  />
                  <h3 className="product-detail-title">{product.name}</h3>
                  <p className="product-detail-text">{product.description}</p>
                  <div className="product-detail-price-box">
                    <p className="product-detail-price">₹{product.price.toLocaleString("en-IN")}</p>
                    {product.originalPrice && (
                      <p className="product-detail-discount">₹{product.originalPrice.toLocaleString("en-IN")}</p>
                    )}
                  </div>

                  <div>
                    <form onSubmit={handleAddToCart} className="w-commerce-commerceaddtocartform cart-default two flex items-center gap-3">
                      <input
                        type="number"
                        pattern="^[0-9]+$"
                        inputMode="numeric"
                        min="1"
                        className="w-commerce-commerceaddtocartquantityinput cart-quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <input
                        type="submit"
                        className="w-commerce-commerceaddtocartbutton cart-button cursor-pointer"
                        value="Add to Cart"
                      />
                      <button
                        type="button"
                        onClick={handleBuyNow}
                        className="px-6 py-3.5 bg-[#0c1013] text-white rounded-full font-semibold hover:bg-neutral-800 transition-colors shadow-md cursor-pointer text-sm whitespace-nowrap"
                      >
                        Buy Now
                      </button>
                    </form>
                  </div>
                </div>

                {/* Product List Bullets */}
                <div className="product-list-box">
                  <div className="product-list">
                    <div className="product-list-dot" />
                    <p className="product-list-text">Availability: In Stock</p>
                  </div>
                  <div className="product-list">
                    <div className="product-list-dot" />
                    <p className="product-list-text">SKU: WH-2026</p>
                  </div>
                  <div className="product-list">
                    <div className="product-list-dot" />
                    <p className="product-list-text">Free Shipping &amp; Returns</p>
                  </div>
                </div>

                {/* Rich Text Overview */}
                <div className="product-rich-text-box">
                  <div className="product-rich-text w-richtext">
                    <h3>Product Overview</h3>
                    <p>{product.description}</p>
                    <p>
                      Powered by high-speed hardware and advanced architecture, ensuring smooth frame rates, ultra-realistic acoustics and visuals, and near-zero latency. Say goodbye to lag and hello to uninterrupted sessions that fully immerse you in every adventure.
                    </p>
                    <p>
                      Experience lifelike visuals on 4K UHD displays with HDR support, bringing your interactions to life with vibrant colors and deep contrasts. Paired with 3D spatial audio, it creates an immersive soundscape that lets you hear every nuance in stunning clarity.
                    </p>
                    <ul role="list">
                      <li>High-Speed Performance: Instant responsiveness with optimized thermal management.</li>
                      <li>Universal Compatibility: Seamless integration across macOS, iOS, Android, and Windows.</li>
                      <li>Ergonomic Design: Crafted from premium aircraft-grade aluminum and aerospace polymers.</li>
                      <li>All-Day Battery &amp; Connectivity: Fast-charging capabilities with ultra-low latency wireless links.</li>
                    </ul>
                  </div>
                </div>

                {/* Specifications Table */}
                <div className="product-specs-wrap">
                  <h3 className="product-specs-title">Product Specification</h3>
                  <div className="product-specs-box">
                    {product.specs && product.specs.length > 0 ? (
                      product.specs.map((spec, idx) => (
                        <div className="product-specs" key={idx}>
                          <p className="product-specs-text">{spec.label}:</p>
                          <p className="product-specs-text-two">{spec.value}</p>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="product-specs">
                          <p className="product-specs-text">Microphone Type:</p>
                          <p className="product-specs-text-two">Condenser</p>
                        </div>
                        <div className="product-specs">
                          <p className="product-specs-text">Polar Pattern:</p>
                          <p className="product-specs-text-two">Cardioid</p>
                        </div>
                        <div className="product-specs">
                          <p className="product-specs-text">Sample Rate:</p>
                          <p className="product-specs-text-two">192kHz / 24-bit</p>
                        </div>
                        <div className="product-specs">
                          <p className="product-specs-text">Connectivity:</p>
                          <p className="product-specs-text-two">USB-C</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Delivery & Returns */}
                <div className="product-specs-wrap delivery">
                  <h3 className="product-specs-title">Delivery &amp; returns</h3>
                  <p className="delivery-text">
                    This is a digital product — no shipping, no returns. You’ll receive it within a few minutes of purchase. If you’d like a printed version for someone special, let us know after checkout — we’ll send you a printable PDF.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Reviews Box */}
          <div className="product-reviews-box">
            <h3 className="product-reviews-title">Product Reviews</h3>

            {/* Review 1 */}
            <div className="product-review">
              <div className="product-review-img-box">
                <img
                  loading="lazy"
                  src="/assets/6992c4e7b47d526698f7bfd3_1.avif"
                  alt="Steven Rich"
                  className="product-review-image"
                />
                <div className="product-review-title-box">
                  <h6 className="product-review-name">Steven Rich</h6>
                  <p className="product-review-date">5 months ago</p>
                  <img
                    src="/assets/6992c43f6ade0abf82fa71c8_star_star_star_star_star.svg"
                    loading="lazy"
                    alt="5 stars"
                    className="product-review-icon"
                  />
                </div>
              </div>
              <div className="product-review-content">
                <h6 className="product-review-title">I just received my new ProX Gaming Console</h6>
                <p className="product-review-text">
                  I recently upgraded to the luminatech smart home system, and it has completely transformed my living space. the ease of control through the app and voice commands has made managing my home a breeze. the integration with various smart devices allows for a seamless and efficient lifestyle. the security features, including remote camera access and smart door locks, provide me with peace of mind when away from home. luminatech has truly elevated my home into a modern, connected haven.
                </p>
              </div>
            </div>

            {/* Review 2 */}
            <div className="product-review">
              <div className="product-review-img-box">
                <img
                  loading="lazy"
                  src="/assets/6992c4e755b06c861c56ef25_2.avif"
                  alt="Robert Walkar"
                  className="product-review-image"
                />
                <div className="product-review-title-box">
                  <h6 className="product-review-name">Robert Walkar</h6>
                  <p className="product-review-date">5 months ago</p>
                  <img
                    src="/assets/6992c43f6ade0abf82fa71c8_star_star_star_star_star.svg"
                    loading="lazy"
                    alt="5 stars"
                    className="product-review-icon"
                  />
                </div>
              </div>
              <div className="product-review-content">
                <h6 className="product-review-title">Beautiful And Easy Use</h6>
                <p className="product-review-text">
                  I&apos;ve been using the techpulse fitness tracker for the past month, and it&apos;s been a game-changer for my health and wellness journey. the accurate heart rate monitoring and step tracking keep me motivated to stay active throughout the day. the sleek design is comfortable to wear, and the battery life is impressive, lasting me a whole week on a single charge. the accompanying app is user-friendly and provides insightful data on my fitness progress, making it easy to set and achieve my goals.
                </p>
              </div>
            </div>

            {/* Review 3 */}
            <div className="product-review last">
              <div className="product-review-img-box">
                <img
                  loading="lazy"
                  src="/assets/6992c4e93c116ac0d6d97828_3.avif"
                  alt="Moniqa Linda"
                  className="product-review-image"
                />
                <div className="product-review-title-box">
                  <h6 className="product-review-name">Moniqa Linda</h6>
                  <p className="product-review-date">5 months ago</p>
                  <img
                    src="/assets/6992c43f6ade0abf82fa71c8_star_star_star_star_star.svg"
                    loading="lazy"
                    alt="5 stars"
                    className="product-review-icon"
                  />
                </div>
              </div>
              <div className="product-review-content">
                <h6 className="product-review-title">Exactly What I Was Looking For</h6>
                <p className="product-review-text">
                  I recently upgraded to the luminatech smart home system, and it has completely transformed my living space. the ease of control through the app and voice commands has made managing my home a breeze. the integration with various smart devices allows for a seamless and efficient lifestyle. the security features, including remote camera access and smart door locks, provide me with peace of mind when away from home. luminatech has truly elevated my home into a modern, connected haven.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      <section className="product-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="section-title-box">
            <div className="section-subtitle-box">
              <div className="section-subtitle-dot" />
              <p className="section-subtitle">Latest addition</p>
            </div>
            <h2 className="section-title">Related Product</h2>
          </div>
          <div className="w-dyn-list">
            <div role="list" className="cat-cms w-dyn-items">
              {relatedProducts.map((p) => (
                <div role="listitem" className="w-dyn-item" key={p.slug}>
                  <div className="new-product">
                    <a href={`/product/${p.slug}`} className="new-product-image-box w-inline-block">
                      <img
                        loading="lazy"
                        alt={p.name}
                        src={p.image}
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
                        <a href={`/product/${p.slug}`} className="new-product-title-link w-inline-block">
                          <h3 className="new-product-title">{p.name}</h3>
                        </a>
                      </div>
                      <div className="product-price-box">
                        <p className="product-price">₹{p.price.toLocaleString("en-IN")}</p>
                        <div>
                          <button
                            type="button"
                            onClick={() => handleAddRelatedToCart(p.name)}
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
