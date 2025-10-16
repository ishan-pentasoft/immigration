"use client";

import React, { useEffect, useState } from "react";
import EmblaCarousel from "./EmblaCarousel";
import apiClient from "@/lib/api";
import { Visa } from "@/types";

const ServicesCarousel = () => {
  const [services, setServices] = useState<Visa[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await apiClient.user.visas.list();
        if (isMounted) setServices(res.visas);
      } catch (err) {
        console.error("Failed to fetch visas:", err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const slides = services.map((service) => ({
    title: service.title,
    image: service.imageUrl ?? "",
    link: `/visa/${service.slug}`,
  }));

  const newSlides = slides.slice(0, 6);
  const options = { loop: true, align: "center" } as const;

  if (newSlides) {
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
          <h2 className="text-3xl sm:text-5xl mt-5 font-bold text-primary italic text-center">
            Our Services
          </h2>
          <div className="relative w-full overflow-hidden">
            <EmblaCarousel slides={newSlides} options={options} />
          </div>
        </div>
      </section>
    );
  }
};

export default ServicesCarousel;
