"use client";

import React from "react";

import dynamic from "next/dynamic";
import Image from "next/image";

// Lighthouse: dynamically import the heavy map and disable SSR
const WorldMap = dynamic(() => import("./ui/world-map"), {
  ssr: false,
  loading: () => null,
});

const Footer = () => {
  return (
    <section className="px-3 pt-10 relative overflow-hidden border-t border-border">
      <div
        className="absolute inset-0 -z-1 pointer-events-none select-none hidden md:block"
        aria-hidden
      >
        <div className="w-full h-full opacity-20">
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
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <Image
            src="/logo.png"
            alt="Logo"
            width={300}
            height={300}
            className="mb-4"
            priority
            draggable={false}
            loading="eager"
          />
          <p className="text-accent">
            We are a team of experts dedicated to helping you navigate the
            complexities of immigration.
          </p>
        </div>
        <div className="col-span-1">
          <h3 className="text-xl font-bold text-primary">Quick Links</h3>
          <hr className="border-accent w-1/2 mb-2" />
          <ul className="list-disc list-inside">
            <li>Home</li>
            <li>Services</li>
            <li>Blog</li>
            <li>Contact</li>
          </ul>
        </div>
        <div className="col-span-1">
          <h3 className="text-xl font-bold text-primary">Contact Us</h3>
          <hr className="border-accent w-1/2 mb-2" />
          <p>
            123 Main Street, Anytown, USA <br />
            Phone: +91 8283994938
            <br />
            Email: info@pentasoftprofessional.com
          </p>
        </div>
      </div>
      <hr className="border-accent mt-5" />
      <div className="text-center my-4">
        <p>© {new Date().getFullYear()} Pentasoft. All rights reserved.</p>
      </div>
    </section>
  );
};

export default Footer;
