"use client";

import React, { useState } from "react";

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  const marqueeWords = [
    "Gaming Setups",
    "Smart Home",
    "Top Brands",
    "Big Deals",
    "Gaming Setups",
    "Smart Home",
    "Top Brands",
    "Big Deals",
  ];

  return (
    <section className="video-section">
      <div className="video-wrapper">
        {/* Background Tickers */}
        <div className="marquee-wrap w-full flex flex-col gap-4 pointer-events-none">
          {/* Top Blue Ticker */}
          <div className="marquee-box two overflow-hidden -rotate-2 scale-105 shadow-md">
            <div className="marquee-inner-two one py-3 flex animate-marquee whitespace-nowrap">
              {Array.from({ length: 4 }).map((_, loopIdx) => (
                <div key={loopIdx} className="marquee-two flex items-center gap-6 px-4">
                  {marqueeWords.map((word, wIdx) => (
                    <React.Fragment key={wIdx}>
                      <p className="marquee-text font-black text-2xl sm:text-4xl">{word}</p>
                      <p className="marquee-dot text-2xl sm:text-4xl">•</p>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Dark Ticker */}
          <div className="marquee-box three overflow-hidden rotate-2 scale-105 shadow-sm">
            <div className="marquee-inner-two two py-3 flex animate-marquee-reverse whitespace-nowrap">
              {Array.from({ length: 4 }).map((_, loopIdx) => (
                <div key={loopIdx} className="marquee-two flex items-center gap-6 px-4">
                  {marqueeWords.map((word, wIdx) => (
                    <React.Fragment key={wIdx}>
                      <p className="marquee-text dark font-black text-2xl sm:text-4xl">{word}</p>
                      <p className="marquee-dot dark text-2xl sm:text-4xl">•</p>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Foreground Video Box */}
        <div className="video-box max-w-[90vw] md:max-w-[1080px] h-[360px] sm:h-[480px] md:h-[620px] relative z-20">
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="hero-lightbox w-inline-block w-lightbox cursor-pointer border-none bg-white hover:bg-neutral-900 transition-colors z-30"
            aria-label="open lightbox"
          >
            <div className="hero-video-icon-box">
              <img
                src="/assets/69d0e504da6b1103fb0b94ac_play-button-arrowhead.png"
                alt="Play"
                className="hero-video-icon"
              />
            </div>
          </button>

          <div
            onClick={() => setIsPlaying(true)}
            className="video-image-box w-full h-full cursor-pointer group"
          >
            <img
              src="/assets/69d13308f534049e75dc98e1_Untitled_design.avif"
              alt="Young woman wearing VR headset"
              className="video w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsPlaying(false)} />
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl z-10">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/bhoybya39QU?autoplay=1"
              title="Givolt Showcase"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
