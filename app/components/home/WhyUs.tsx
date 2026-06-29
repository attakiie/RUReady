import { Users, Target, Zap, Heart } from "lucide-react";

const pillars = [
  {
    icon: Users,
    title: "Built by Players",
    desc: "We shoot IPSC. We know what you need before you do.",
  },
  {
    icon: Target,
    title: "Tested on the Range",
    desc: "Every product earns its place on the table through real competition.",
  },
  {
    icon: Zap,
    title: "Fast Shipping",
    desc: "Order before 2PM, ships same day. Nationwide coverage.",
  },
  {
    icon: Heart,
    title: "Friendly Community",
    desc: "Beginners welcome. The only barrier to entry is the beep.",
  },
];

export default function WhyUs() {
  return (
    <section className="py-24 bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 max-w-xl">
          <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Why Us
          </p>
          <h2
            className="text-[clamp(40px,6vw,72px)] leading-none font-display text-[#F5F5F5]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Why R U READY
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div key={i} className="group">
                {/* Number */}
                <div
                  className="text-[#2B2B2E] text-[80px] leading-none font-display mb-4 select-none"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  aria-hidden
                >
                  0{i + 1}
                </div>
                <Icon
                  size={24}
                  className="text-[#D32F3A] mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="text-[#F5F5F5] font-semibold text-sm tracking-wide uppercase mb-2">
                  {pillar.title}
                </h3>
                <p className="text-[#A5A5A5] text-sm leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
