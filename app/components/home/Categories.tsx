"use client";

import Link from "next/link";
import { Wind, Target, Layers, Printer } from "lucide-react";

const categories = [
  {
    id: "green-gas",
    icon: Wind,
    label: "Green Gas",
    desc: "High-pressure propellant for GBB pistols",
    href: "/shop?cat=green-gas",
    count: 3,
  },
  {
    id: "targets",
    icon: Target,
    label: "Targets",
    desc: "IPSC-spec steel and popper targets",
    href: "/shop?cat=targets",
    count: 5,
  },
  {
    id: "accessories",
    icon: Layers,
    label: "Accessories",
    desc: "Holsters, mag pouches, range gear",
    href: "/shop?cat=accessories",
    count: 12,
  },
  {
    id: "3d-print",
    icon: Printer,
    label: "3D Print",
    desc: "Custom printed parts & accessories",
    href: "/shop?cat=3d-print",
    count: 8,
  },
];

export default function Categories() {
  return (
    <section className="py-24 bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Browse
            </p>
            <h2
              className="text-[clamp(40px,6vw,72px)] leading-none font-display text-[#F5F5F5]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Gear Up
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex text-[#A5A5A5] hover:text-[#F5F5F5] text-sm tracking-wide uppercase transition-colors duration-200 underline underline-offset-4"
          >
            All Products
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="group relative flex flex-col p-6 bg-[#1A1A1C] border border-[#2B2B2E] hover:border-[#D32F3A] transition-all duration-200 overflow-hidden"
              >
                {/* Red glow on hover */}
                <div className="absolute inset-0 bg-[#D32F3A] opacity-0 group-hover:opacity-[0.04] transition-opacity duration-200" />

                {/* Top corner accent */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#D32F3A] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                {/* Icon */}
                <div className="mb-auto">
                  <Icon
                    size={28}
                    className="text-[#D32F3A] mb-5"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Text */}
                <div>
                  <h3
                    className="text-[28px] leading-none font-display text-[#F5F5F5] mb-2 group-hover:text-[#D32F3A] transition-colors duration-200"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {cat.label}
                  </h3>
                  <p className="text-[#A5A5A5] text-xs leading-relaxed mb-4 hidden sm:block">
                    {cat.desc}
                  </p>
                  <span className="text-[#2B2B2E] text-xs tracking-widest uppercase">
                    {cat.count} items
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
