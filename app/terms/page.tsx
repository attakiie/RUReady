import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "ข้อกำหนดและนโยบายความเป็นส่วนตัว",
  description: "ข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัวของ R U READY",
};

const sections = [
  {
    id: "terms",
    title: "ข้อกำหนดการใช้งาน",
    updated: "อัปเดตล่าสุด: 1 กรกฎาคม 2569",
    content: [
      {
        heading: "1. การยอมรับข้อกำหนด",
        body: "การใช้งานเว็บไซต์ ru-ready.vercel.app และการสั่งซื้อสินค้าจาก R U READY ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขเหล่านี้ทั้งหมด หากคุณไม่ยอมรับ กรุณางดใช้งานเว็บไซต์",
      },
      {
        heading: "2. สินค้าและราคา",
        body: "ราคาสินค้าทั้งหมดเป็นสกุลเงินบาทไทย (THB) และรวมภาษีมูลค่าเพิ่มแล้ว เราสงวนสิทธิ์ในการเปลี่ยนแปลงราคาโดยไม่แจ้งล่วงหน้า สินค้าที่แสดงในเว็บไซต์ขึ้นอยู่กับความพร้อมของสต็อก",
      },
      {
        heading: "3. การสั่งซื้อและการชำระเงิน",
        body: "การสั่งซื้อสมบูรณ์เมื่อเราได้รับการชำระเงินและยืนยันแล้วเท่านั้น เราใช้การโอนเงินผ่าน PromptPay เป็นช่องทางหลัก กรุณาส่งหลักฐานการโอนเงินผ่าน LINE หลังจากทำรายการ",
      },
      {
        heading: "4. การจัดส่ง",
        body: "เราจัดส่งทั่วประเทศไทยผ่านบริการขนส่งชั้นนำ ระยะเวลาจัดส่งโดยทั่วไป 1–3 วันทำการ สำหรับกรุงเทพฯ และปริมณฑล และ 2–5 วันทำการสำหรับต่างจังหวัด ค่าจัดส่งคำนวณตามน้ำหนักและขนาดพัสดุ",
      },
      {
        heading: "5. การคืนสินค้าและการคืนเงิน",
        body: "สินค้าสามารถคืนได้ภายใน 7 วันนับจากวันที่ได้รับ โดยสินค้าต้องอยู่ในสภาพเดิม ไม่ผ่านการใช้งาน และมีบรรจุภัณฑ์ครบถ้วน กรุณาติดต่อเราผ่าน LINE ก่อนส่งสินค้าคืน ค่าขนส่งสินค้าคืนเป็นความรับผิดชอบของผู้ซื้อ ยกเว้นกรณีสินค้าชำรุดบกพร่องจากการผลิต",
      },
      {
        heading: "6. ข้อจำกัดความรับผิด",
        body: "R U READY ไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดจากการใช้สินค้าที่ผิดวิธีหรือไม่ตรงตามคำแนะนำ สินค้าทั้งหมดมีไว้สำหรับกีฬา Action Air และ IPSC เท่านั้น",
      },
      {
        heading: "7. การเปลี่ยนแปลงข้อกำหนด",
        body: "เราสงวนสิทธิ์ในการแก้ไขข้อกำหนดเหล่านี้ได้ตลอดเวลา การเปลี่ยนแปลงจะมีผลทันทีเมื่อเผยแพร่บนเว็บไซต์ การใช้งานเว็บไซต์ต่อไปถือว่าคุณยอมรับข้อกำหนดที่แก้ไขแล้ว",
      },
    ],
  },
  {
    id: "privacy",
    title: "นโยบายความเป็นส่วนตัว",
    updated: "อัปเดตล่าสุด: 1 กรกฎาคม 2569",
    content: [
      {
        heading: "1. ข้อมูลที่เราเก็บรวบรวม",
        body: "เราเก็บข้อมูลที่คุณให้ไว้เมื่อสมัครสมาชิกหรือสั่งซื้อ ได้แก่ ชื่อ-นามสกุล อีเมล เบอร์โทรศัพท์ และที่อยู่จัดส่ง นอกจากนี้ยังเก็บข้อมูลการใช้งานเว็บไซต์ เช่น หน้าที่เข้าชมและเวลาเข้าใช้งาน",
      },
      {
        heading: "2. วัตถุประสงค์การใช้ข้อมูล",
        body: "เราใช้ข้อมูลของคุณเพื่อประมวลผลคำสั่งซื้อ จัดส่งสินค้า ติดต่อสอบถามเรื่องออเดอร์ และส่งข้อมูลโปรโมชั่น (เฉพาะในกรณีที่คุณยินยอม) เราไม่ขายหรือเปิดเผยข้อมูลส่วนบุคคลแก่บุคคลที่สาม ยกเว้นผู้ให้บริการขนส่งที่จำเป็นต้องใช้ข้อมูลเพื่อจัดส่งพัสดุ",
      },
      {
        heading: "3. การรักษาความปลอดภัยของข้อมูล",
        body: "เราใช้ Supabase ในการจัดการฐานข้อมูล ซึ่งมีมาตรการรักษาความปลอดภัยระดับองค์กร ข้อมูลรหัสผ่านถูกเข้ารหัสและไม่มีผู้ใดสามารถเข้าถึงได้ รวมถึงทีมงานของเรา",
      },
      {
        heading: "4. คุกกี้",
        body: "เว็บไซต์ใช้คุกกี้จำเป็นสำหรับการจัดการ Session การล็อกอิน และตะกร้าสินค้า เราไม่ใช้คุกกี้เพื่อการติดตามหรือโฆษณา",
      },
      {
        heading: "5. สิทธิ์ของเจ้าของข้อมูล",
        body: "คุณมีสิทธิ์เข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณได้ตลอดเวลาผ่านหน้า 'บัญชีของฉัน' หรือติดต่อเราผ่าน LINE เพื่อขอลบบัญชีและข้อมูลทั้งหมด",
      },
      {
        heading: "6. การเก็บรักษาข้อมูล",
        body: "เราเก็บข้อมูลส่วนบุคคลตราบเท่าที่จำเป็นสำหรับการให้บริการ ข้อมูลออเดอร์จะถูกเก็บไว้เป็นเวลา 3 ปีเพื่อวัตถุประสงค์ทางบัญชีและภาษี",
      },
      {
        heading: "7. ติดต่อเราเรื่องความเป็นส่วนตัว",
        body: "หากมีคำถามหรือข้อกังวลเกี่ยวกับการใช้ข้อมูลส่วนบุคคล กรุณาติดต่อเราผ่าน LINE OpenChat หรือหน้าติดต่อเรา",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <main className="min-h-screen bg-[#0F0F10] pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#555] hover:text-[#D32F3A] text-xs uppercase tracking-widest mb-8 transition-colors"
          >
            <ArrowLeft size={12} /> กลับหน้าแรก
          </Link>

          <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            Legal
          </p>
          <h1
            className="text-[clamp(40px,8vw,72px)] leading-none text-[#F5F5F5] mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            ข้อกำหนด & ความเป็นส่วนตัว
          </h1>
          <p className="text-[#A5A5A5] text-sm mb-12">
            โปรดอ่านข้อกำหนดและนโยบายความเป็นส่วนตัวก่อนใช้งานเว็บไซต์
          </p>

          {/* Quick nav */}
          <div className="flex gap-4 mb-12">
            <a
              href="#terms"
              className="text-xs font-semibold tracking-widest uppercase border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#D32F3A] px-4 py-2 transition-colors"
            >
              ข้อกำหนด
            </a>
            <a
              href="#privacy"
              className="text-xs font-semibold tracking-widest uppercase border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#D32F3A] px-4 py-2 transition-colors"
            >
              ความเป็นส่วนตัว
            </a>
          </div>

          {sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-16 scroll-mt-24">
              <div className="border-l-2 border-[#D32F3A] pl-5 mb-8">
                <h2
                  className="text-[clamp(28px,5vw,40px)] leading-none text-[#F5F5F5] mb-1"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {section.title}
                </h2>
                <p className="text-[#555] text-xs">{section.updated}</p>
              </div>

              <div className="flex flex-col gap-px bg-[#2B2B2E]">
                {section.content.map((item) => (
                  <div key={item.heading} className="bg-[#1A1A1C] px-6 py-5">
                    <h3 className="text-[#F5F5F5] text-sm font-semibold mb-2">
                      {item.heading}
                    </h3>
                    <p className="text-[#A5A5A5] text-sm leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Contact CTA */}
          <div className="bg-[#1A1A1C] border border-[#2B2B2E] px-6 py-6 text-center">
            <p className="text-[#A5A5A5] text-sm mb-4">
              มีคำถามเพิ่มเติม? ติดต่อเราได้เลย
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-[#D32F3A] hover:bg-[#D32F3A] text-[#D32F3A] hover:text-[#F5F5F5] text-xs font-semibold px-5 py-2.5 tracking-widest uppercase transition-colors duration-200"
            >
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
