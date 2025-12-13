import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ServiceAreas from "@/components/ServiceAreas";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CleaningTeam from "@/components/CleaningTeam";
import FeaturedCleaners from "@/components/FeaturedCleaners";
import CleaningGuides from "@/components/CleaningGuides";
import ReadyToStart from "@/components/ReadyToStart";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
      <ServiceAreas />
      <HowItWorks />
      <FeaturedCleaners />
      <CleaningTeam />
      <CleaningGuides />
      <Testimonials />
      <ReadyToStart />
      <Contact />
      <Footer />
    </main>
  );
}
