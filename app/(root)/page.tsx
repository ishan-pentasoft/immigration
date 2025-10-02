import React from "react";
import dynamic from "next/dynamic";

const Hero = dynamic(() => import("@/components/Hero"), {
  loading: () => null,
});
const ServicesCarousel = dynamic(() => import("@/components/ServicesCarousel"), {
  loading: () => null,
});
const ServicesGrid = dynamic(() => import("@/components/ServicesGrid"), {
  loading: () => null,
});
const Stats = dynamic(() => import("@/components/Stats"), {
  loading: () => null,
});
const PartneredWith = dynamic(() => import("@/components/PartneredWith"), {
  loading: () => null,
});
const CountryOrbit = dynamic(() => import("@/components/CountryOrbit"), {
  loading: () => null,
});
const OurTeam = dynamic(() => import("@/components/OurTeam"), {
  loading: () => null,
});

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
    </div>
  );
};

export default page;
