"use client";

import React from "react";

export default function InstagramGrid() {
  const columns = [
    // Column 1
    [
      { img: "/assets/698986f05b7a3c2eb365ed5b_1.avif", likes: "148 likes", alt: "Wireless earbuds neon" },
      { img: "/assets/6989879ff8f7ece20431a128_2.avif", likes: "656 likes", alt: "Black blender" },
      { img: "/assets/6989879ed179a8ca234af2cb_3.avif", likes: "564 likes", alt: "Tablet smart screen" },
    ],
    // Column 2
    [
      { img: "/assets/69898825268c370cc85db49f_4.avif", likes: "1,405 likes", alt: "Cylindrical speaker" },
      { img: "/assets/698988256e1b102d021c121c_5.avif", likes: "145 likes", alt: "VR headset on white" },
      { img: "/assets/69898825e1f7bd30a987cd18_6.avif", likes: "524 likes", alt: "Green headphones" },
    ],
    // Column 3
    [
      { img: "/assets/6989888b5a8c032875bcb784_7.avif", likes: "175 likes", alt: "Woman in orange earmuffs" },
      { img: "/assets/6989888b389af8ebec996a4b_8.avif", likes: "745 likes", alt: "Wireless black headphones" },
      { img: "/assets/6989888b8bce69091b37f010_9.avif", likes: "455 likes", alt: "Digital stove panel" },
    ],
    // Column 4
    [
      { img: "/assets/698988c2434597db6c216e6c_10.avif", likes: "245 likes", alt: "Audio Pro studio speaker" },
      { img: "/assets/698988c2d80291ea65413117_11.avif", likes: "355 likes", alt: "Earbuds on white geometric shapes" },
      { img: "/assets/698988c3508bdc1a4573264f_12.avif", likes: "145 likes", alt: "Black headphones on gradient" },
    ],
  ];

  return (
    <section className="follow-section">
      <div className="w-layout-blockcontainer container w-container">
        {/* Header */}
        <div className="section-title-box center">
          <h2 className="section-title">Follow Us @Instagram</h2>
          <p className="section-text">
            Stay connected with us on Instagram for the latest arrivals and updates
          </p>
        </div>

        {/* Gallery */}
        <div className="master-gallery-about">
          {columns.map((col, colIdx) => (
            <div
              key={colIdx}
              className={`column-gallery-about ${
                colIdx === 0
                  ? "column-one"
                  : colIdx === 1
                  ? "column-two"
                  : colIdx === 2
                  ? "column-three"
                  : "column-two _2"
              }`}
            >
              <div className="inside-gallery-about">
                <div className="item-gallery-about">
                  {col.map((item, itemIdx) => (
                    <a
                      key={itemIdx}
                      href="https://www.instagram.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="follow-box w-inline-block group mb-4"
                    >
                      <div className="follow-image-box">
                        <img
                          src={item.img}
                          alt={item.alt}
                          className="follow-image transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="bg image-overlay" />
                        <div className="follow-icon-box shadow-md">
                          <img
                            src="/assets/69cf6a8cbf2f3da99d9ed5c4_instagram-svgrepo-com__1__1.svg"
                            alt="Instagram"
                            className="follow-icon"
                          />
                        </div>
                      </div>
                      <div className="follow-like-box">
                        <img
                          src="/assets/6989872cee5826541e8ca834_Vector.svg"
                          alt="Likes"
                          className="follow-like-icon"
                        />
                        <p className="follow-like-text">{item.likes}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="follow-shadow" />
          <div className="follow-shadow top" />
        </div>
      </div>
    </section>
  );
}
