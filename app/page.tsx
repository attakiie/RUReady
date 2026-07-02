import Footer from "@/app/components/layout/Footer";
import Hero from "@/app/components/home/Hero";
import Categories from "@/app/components/home/Categories";
import FeaturedProducts from "@/app/components/home/FeaturedProducts";
import WhyUs from "@/app/components/home/WhyUs";
import CTABanner from "@/app/components/home/CTABanner";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <Categories />
        <FeaturedProducts />
        <WhyUs />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
