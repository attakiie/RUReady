# R U READY — Project Context

## Brand
- Name: R U READY
- Tagline: "Performance gear for Action Air players"
- Origin: IPSC Range Officer command — "R U READY?"
- Market: Thailand, Action Air / IPSC community

## Design System
| Token        | Value     |
|-------------|-----------|
| Brand Red    | #D32F3A   |
| Red Dim      | #A02029   |
| Background   | #0F0F10   |
| Surface      | #1A1A1C   |
| Border       | #2B2B2E   |
| Text         | #F5F5F5   |
| Secondary    | #A5A5A5   |

Fonts: Bebas Neue (headlines) · Inter (body)
Motion: 200-300ms · No slow easing · No parallax

## Stack
- Next.js 16 · TypeScript · Tailwind CSS v4 · Framer Motion
- Supabase (auth + db) · Vercel (hosting)

## Microcopy
| Context     | Copy             |
|-------------|------------------|
| Add to Cart | Gear Up          |
| Added       | Locked In.       |
| Checkout    | Ready to Go      |
| Complete    | You're Ready.    |
| Shipping    | Your Gear Is On The Way. |
| Loading     | Stand By...      |
| Loaded      | BEEP.            |

## Folder Structure
app/
  components/
    layout/    — Navbar, Footer
    home/      — Hero, Categories, FeaturedProducts, WhyUs, CTABanner
    ui/        — Shared UI primitives
  (routes)/    — shop/, products/[slug]/, cart/, etc.
lib/           — utils, types, constants

## Products (V1)
- ET-1000 Green Gas — ฿230
- Top Gas 12kg — ฿260
- Mini Popper — ฿180

## Roadmap
Phase 1 (Current): Homepage ✅
Phase 2: Shop page + Product page
Phase 3: Cart (slide-over)
Phase 4: Auth (Google Login via NextAuth + Supabase)
Phase 5: Checkout + QR Payment + LINE notify
Phase 6: Member dashboard (order history, address)
Phase 7: Admin panel
