import Hero from "@/components/Hero";
import ServicesCarousel from "@/components/ServicesCarousel";
import ServicesGrid from "@/components/ServicesGrid";
import React from "react";

const page = () => {
  return (
    <div className="select-none">
      <Hero />
      <ServicesCarousel />
      <ServicesGrid />
    </div>
  );
};

export default page;
