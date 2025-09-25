import Hero from "@/components/Hero";
import ServicesCarousel from "@/components/ServicesCarousel";
import React from "react";

const page = () => {
  return (
    <div className="select-none">
      <Hero />
      <ServicesCarousel />
    </div>
  );
};

export default page;
