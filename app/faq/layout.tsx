import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "คำถามที่พบบ่อย",
  description:
    "คำถามที่พบบ่อยเกี่ยวกับการสั่งซื้อ การชำระเงิน การจัดส่ง และการใช้งานอุปกรณ์ Action Air / IPSC จาก R U READY",
  alternates: { canonical: "/faq" },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
