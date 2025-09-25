"use client";

import React from "react";
import EmblaCarousel from "./EmblaCarousel";
// import dynamic from "next/dynamic";

// // Lighthouse: dynamically import the heavy map and disable SSR
// const WorldMap = dynamic(() => import("./ui/world-map"), {
//   ssr: false,
//   loading: () => null,
// });

const ServicesCarousel = () => {
  const slides = [
    {
      title: "Service 1",
      description: "Description 1",
      image: "/usastudyvisa.jpg",
      link: "/service-1",
    },
    {
      title: "Service 2",
      description: "Description 1",
      image: "/usastudyvisa.jpg",
      link: "/service-1",
    },
    {
      title: "Service 3",
      description: "Description 1",
      image: "/usastudyvisa.jpg",
      link: "/service-1",
    },
    {
      title: "Service 4",
      description: "Description 1",
      image: "/usastudyvisa.jpg",
      link: "/service-1",
    },
  ];
  const options = { loop: true, align: "center" } as const;

  return (
    <section className="px-3 py-20">
      <div className="max-w-7xl mx-auto border shadow-accent shadow-xl rounded-4xl p-4 relative w-full overflow-hidden">
        <div
          className="absolute inset-0 -z-1"
          style={{
            backgroundImage: `
        linear-gradient(to right, #d1d5db 1px, transparent 1px),
        linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
      `,
            backgroundSize: "32px 32px",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
          }}
        />

        {/* Decorative background map - hidden on mobile for performance */}
        {/* <div
          className="absolute inset-0 -z-1 pointer-events-none select-none hidden md:block"
          aria-hidden
        >
          <div className="w-full h-full opacity-40">
            <WorldMap
              dots={[
                {
                  start: {
                    lat: 64.2008,
                    lng: -149.4937,
                  }, // Alaska (Fairbanks)
                  end: {
                    lat: 34.0522,
                    lng: -118.2437,
                  }, // Los Angeles
                },
                {
                  start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
                  end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                },
                {
                  start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                  end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
                },
                {
                  start: { lat: 51.5074, lng: -0.1278 }, // London
                  end: { lat: 28.6139, lng: 77.209 }, // New Delhi
                },
                {
                  start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                  end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
                },
                {
                  start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                  end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
                },
              ]}
            />
          </div>
        </div> */}
        <h2 className="text-3xl sm:text-5xl mt-5 font-bold text-primary italic text-center">
          Our Services
        </h2>
        <div className="relative w-full overflow-hidden">
          <EmblaCarousel slides={slides} options={options} />
        </div>
      </div>
    </section>
  );
};

export default ServicesCarousel;
