import CountryOrbit from "@/components/CountryOrbit";
import Hero from "@/components/Hero";
import ServicesCarousel from "@/components/ServicesCarousel";
import ServicesGrid from "@/components/ServicesGrid";
import React from "react";
import OurTeam from "@/components/OurTeam";

const page = () => {
  return (
    <div className="select-none">
      <Hero />
      <ServicesCarousel />
      <ServicesGrid />
      <CountryOrbit />
      <OurTeam />
    </div>
  );
};

export default page;
