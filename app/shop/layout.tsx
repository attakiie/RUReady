import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ร้านค้า",
  description:
    "เลือกซื้ออุปกรณ์ Action Air และ IPSC — Green Gas, เป้ายิง Mini Popper, ET-1000 และอื่นๆ จัดส่งทั่วประเทศ",
  openGraph: {
    title: "ร้านค้า | R U READY",
    description: "อุปกรณ์ Action Air และ IPSC หลากหลาย จัดส่งทั่วไทย",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
