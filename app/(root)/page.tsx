import CountryOrbit from "@/components/CountryOrbit";
import Hero from "@/components/Hero";
import ServicesCarousel from "@/components/ServicesCarousel";
import ServicesGrid from "@/components/ServicesGrid";
import React from "react";
import OurTeam from "@/components/OurTeam";
import PartneredWith from "@/components/PartneredWith";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

const page = () => {
  return (
    <div className="select-none">
      <Hero />
      <ServicesCarousel />
      <ServicesGrid />
      <Stats />
      <PartneredWith />
      <CountryOrbit />
      <OurTeam />
      <Footer />
    </div>
  );
};

export default page;
