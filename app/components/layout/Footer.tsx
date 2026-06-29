import Link from "next/link";

const links = {
  Shop: [
    { label: "Green Gas", href: "/shop?cat=green-gas" },
    { label: "Targets", href: "/shop?cat=targets" },
    { label: "Accessories", href: "/shop?cat=accessories" },
    { label: "3D Print", href: "/shop?cat=3d-print" },
  ],
  Info: [
    { label: "About", href: "/about" },
    { label: "Shipping", href: "/shipping" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
};

const socials = [
  { label: "Facebook", href: "https://facebook.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LINE", href: "https://line.me" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1C] border-t border-[#2B2B2E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div
              className="text-2xl font-display text-[#F5F5F5] tracking-widest mb-3"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              R U READY
            </div>
            <p className="text-[#A5A5A5] text-sm leading-relaxed max-w-xs">
              Performance gear for Action Air players. Friendly. Fast. Built for the range.
            </p>
            {/* Socials */}
            <div className="flex gap-4 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A5A5A5] hover:text-[#D32F3A] text-xs tracking-wide uppercase transition-colors duration-200"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-[#F5F5F5] text-xs font-semibold tracking-[0.15em] uppercase mb-5">
                {group}
              </h4>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-[#A5A5A5] hover:text-[#F5F5F5] text-sm transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / CTA */}
          <div>
            <h4 className="text-[#F5F5F5] text-xs font-semibold tracking-[0.15em] uppercase mb-5">
              Stay Ready
            </h4>
            <p className="text-[#A5A5A5] text-sm mb-4">
              New drops, range days, and member deals.
            </p>
            <a
              href="https://line.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#D32F3A] text-xs font-semibold px-4 py-2.5 tracking-widest uppercase transition-colors duration-200"
            >
              Join LINE Group
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-14 pt-8 border-t border-[#2B2B2E]">
          <p className="text-[#A5A5A5] text-xs">
            © {new Date().getFullYear()} R U READY. All rights reserved.
          </p>
          <p className="text-[#2B2B2E] text-xs tracking-widest uppercase">
            See you on the next stage.
          </p>
        </div>
      </div>
    </footer>
  );
}
