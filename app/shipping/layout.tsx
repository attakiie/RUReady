import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "การจัดส่ง",
  description:
    "ข้อมูลค่าจัดส่งและระยะเวลาส่งสินค้า R U READY จัดส่งทั่วประเทศไทย รวดเร็ว ปลอดภัย มีเลขติดตามพัสดุทุกออเดอร์",
  alternates: { canonical: "/shipping" },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
