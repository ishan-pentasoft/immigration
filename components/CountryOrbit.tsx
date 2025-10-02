"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Button } from "./ui/stateful-button";

const CircularGallery = dynamic(() => import("./ui/CircularGallery"), {
  ssr: false,
  loading: () => null,
});

const CountryOrbit = () => {
  const items = [
    { image: "/country/australia.png", text: "Australia" },
    { image: "/country/canada.png", text: "Canada" },
    { image: "/country/denmark.png", text: "Denmark" },
    { image: "/country/germany.png", text: "Germany" },
    { image: "/country/poland.png", text: "Poland" },
    { image: "/country/sweden.png", text: "Sweden" },
    { image: "/country/switzerland.png", text: "Switzerland" },
    { image: "/country/uk.png", text: "United Kingdom" },
    { image: "/country/usa.png", text: "United States Of America" },
  ];

  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (visible) return; // already mounted
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="py-20 w-full bg-black relative overflow-hidden">
      {/* Crimson Spotlight Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
        radial-gradient(
          circle at center,
          rgba(239, 68, 68, 0.12) 0%,
          rgba(239, 68, 68, 0.1) 20%,
          rgba(0, 0, 0, 0.0) 60%
        )
      `,
        }}
      />

      <div className="max-w-7xl mx-auto w-full ">
        <h2 className="text-3xl md:text-5xl max-w-3xl mx-auto text-center w-full font-bold text-primary italic text-balance">
          Choose Your Country For Immigration
        </h2>
        <div className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px]">
          {visible ? (
            <CircularGallery
              bend={1}
              borderRadius={0.05}
              scrollSpeed={2}
              scrollEase={0.05}
              items={items}
            />
          ) : (
            <div className="w-full h-full" aria-hidden />
          )}
        </div>
        <div className="flex items-center justify-center w-full">
          <Button className="mt-6 bg-primary hover:ring-2 hover:ring-primary font-bold tracking-wide px-6 py-3 text-lg">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CountryOrbit;
