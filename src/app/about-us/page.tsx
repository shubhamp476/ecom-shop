import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Cpu,
  Sparkles,
  Award,
  Users,
  Compass,
  ArrowRight,
  Zap,
  CheckCircle2,
  HeartHandshake,
  Layers,
  Leaf,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | ECOM-SHOP — Curated Electronics & Next-Gen Gadgets",
  description:
    "Discover the story behind ECOM-SHOP (Givolt). We design and curate precision-engineered tech, audio gear, and smart home solutions built for performance and longevity.",
};

const STATS = [
  { value: "50K+", label: "Delighted Customers", detail: "Across India & Global Markets" },
  { value: "99.8%", label: "On-Time Dispatch", detail: "Within 24 Hours of Order" },
  { value: "100%", label: "Genuine Warranty", detail: "Authorized Brand Coverage" },
  { value: "4.9★", label: "Customer Rating", detail: "Based on 12,000+ Verified Reviews" },
];

const VALUES = [
  {
    icon: <Cpu className="w-6 h-6 text-blue-600" />,
    title: "Precision Engineering",
    description:
      "We obsess over acoustic resonance, mechanical switch tactile curves, and thermal dissipation so every device outperforms expectations.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-blue-600" />,
    title: "Minimalist Industrial Design",
    description:
      "Form follows emotion. Our aesthetic blends anodized aluminum, matte ceramics, and purposeful ergonomics that elevate any modern workspace.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
    title: "Verified Authenticity",
    description:
      "Zero counterfeit risk. Every smartphone, audio monitor, and smart home sensor is factory-sealed with official manufacturer serial tracking.",
  },
  {
    icon: <Leaf className="w-6 h-6 text-blue-600" />,
    title: "Eco-Conscious Packaging",
    description:
      "100% biodegradable soy-ink printed unboxing experience, reduced plastic footprint, and a nationwide e-waste recycling exchange program.",
  },
  {
    icon: <HeartHandshake className="w-6 h-6 text-blue-600" />,
    title: "Human Tech Support",
    description:
      "Real hardware enthusiasts and sound engineers on call 7 days a week — not generic chatbot loops or offshore answering machines.",
  },
  {
    icon: <Layers className="w-6 h-6 text-blue-600" />,
    title: "Curated, Not Cluttered",
    description:
      "We test hundreds of gadgets every quarter, rejecting over 90% to bring you only the standout gear that truly deserves a place on your desk.",
  },
];

const TEAM = [
  {
    name: "Alex Rivera",
    role: "Founder & Chief Architect",
    image: "/assets/69d13b3baa611e87c5b41017_10.avif",
    bio: "Former acoustics engineer with 12+ years designing studio monitors and battle-tested peripherals.",
  },
  {
    name: "Elena Chen",
    role: "Head of Industrial Design",
    image: "/assets/69d4a88b6ec9fb5582a36aeb_1.avif",
    bio: "Red Dot Award winner passionate about tactile interaction, clean desk aesthetics, and premium metallurgy.",
  },
  {
    name: "Marcus Vance",
    role: "VP of Quality & Logistics",
    image: "/assets/69df49f8b6db64a130852714_Mask-group.avif",
    bio: "Supply chain veteran who scaled fulfillment for tier-1 electronic brands across South Asia.",
  },
  {
    name: "Priya Nair",
    role: "Director of Customer Care",
    image: "/assets/69e5d6cac651252f78781dce_4.avif",
    bio: "Dedicated to creating seamless 7-day hassle-free replacements and personal product consultations.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7] text-neutral-900 selection:bg-blue-600 selection:text-white font-sans">
      {/* 1. Header / Navigation */}
      <Navbar />

      <main>
        {/* 2. Hero Section */}
        <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden border-b border-black/5">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" /> Our Story &amp; Purpose
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.15]">
                Engineering the Future of Everyday Technology
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
                Born out of a simple conviction: technology should feel like a finely tuned instrument, not a disposable gadget. We curate and craft electronic hardware that elevates how you live, work, and create.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-4">
                <Link
                  href="/shop"
                  className="px-7 py-4 bg-[#2563eb] text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm"
                >
                  Explore Our Collection <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="px-7 py-4 bg-white border border-gray-200 text-neutral-800 rounded-full font-semibold hover:bg-neutral-50 transition-all text-sm shadow-xs"
                >
                  Contact Concierge
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Key Milestone Metrics */}
        <section className="py-16 bg-white border-b border-black/5">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center p-6 rounded-3xl bg-[#faf9f7] border border-black/5">
                  <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight mb-1 font-mono">
                    {stat.value}
                  </p>
                  <p className="text-sm font-bold text-neutral-900 mb-0.5">{stat.label}</p>
                  <p className="text-xs text-neutral-500">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. The Narrative / Origin Story */}
        <section className="py-24 max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">The Genesis</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
                Tired of Disposable Plastic. Driven by Obsession.
              </h2>
              <div className="space-y-4 text-neutral-600 text-sm sm:text-base leading-relaxed">
                <p>
                  In 2024, our founders gathered around a workbench filled with stripped cables, malfunctioning USB hubs, and headsets that died after 90 days. The consumer electronics market was flooded with generic white-label rebadges designed to break and force another purchase.
                </p>
                <p>
                  We started <strong>ECOM-SHOP (Givolt)</strong> with an uncompromising mission: partner exclusively with verified tier-1 manufacturers, subject every device to grueling real-world testing, and engineer accessories with CNC-machined aluminum housings and reinforced braided cores.
                </p>
                <p>
                  Today, over 50,000 developers, digital artists, gamers, and audiophiles rely on our curated ecosystem to power their everyday work and play.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-neutral-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Strict 50-Point Quality Checklist</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Direct Factory Authorized Sourcing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Transparent Warranty &amp; Invoicing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Express Dispatch Nationwide</span>
                </div>
              </div>
            </div>

            {/* Visual Showcase Box */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/10 bg-neutral-900 aspect-4/3 sm:aspect-16/10">
                <img
                  src="/assets/69d13b3baa611e87c5b41017_10.avif"
                  alt="Electronics craftsmanship"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex items-end p-8">
                  <div className="text-white space-y-1">
                    <span className="text-[11px] font-mono tracking-widest text-blue-400 uppercase font-semibold">
                      Design Studio &bull; Hardware Testing Lab
                    </span>
                    <p className="text-lg font-bold">
                      Every switch calibrated. Every chassis stress-tested.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Our Core Pillars / Values */}
        <section className="py-20 bg-white border-y border-black/5">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">The Givolt Standard</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
                Built Around Principles That Never Compromise
              </h2>
              <p className="text-neutral-500 text-sm sm:text-base">
                How we evaluate, curate, and guarantee every piece of hardware in our store.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {VALUES.map((val, i) => (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-[#faf9f7] hover:bg-[#f2f1ed] transition-all border border-black/5 hover:border-black/10 shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center mb-6 shadow-xs group-hover:scale-110 transition-transform">
                      {val.icon}
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{val.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed font-normal">{val.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Meet The Team */}
        <section className="py-24 max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">The Builders</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Passionate Tech Specialists Behind Every Delivery
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base">
              A tight-knit crew of hardware nerds, industrial designers, and customer advocates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-black/5 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-100 mb-4 border-2 border-blue-600/20 p-1 flex items-center justify-center">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="font-bold text-neutral-900 text-base">{member.name}</h4>
                <p className="text-xs font-semibold text-blue-600 mb-3">{member.role}</p>
                <p className="text-xs text-neutral-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Call To Action Banner */}
        <section className="py-16 bg-[#0c1013] text-white">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 text-center space-y-6">
            <span className="inline-block px-3 py-1 bg-white/10 text-blue-400 text-xs font-mono font-bold rounded-full uppercase tracking-wider">
              Ready to Upgrade?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto">
              Experience Hand-Curated Electronics with Zero Compromises
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto font-normal">
              From flagship smartphones and audiophile DACs to ergonomic work gear, discover hardware crafted to last.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                href="/shop"
                className="px-8 py-4 bg-[#2563eb] hover:bg-blue-600 text-white font-semibold rounded-full shadow-lg shadow-blue-500/25 transition-all text-sm flex items-center gap-2"
              >
                Browse Shop Catalog <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-all text-sm"
              >
                Talk to Support
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}

