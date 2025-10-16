"use client";

import React, { useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import apiClient from "@/lib/api";
import { SiteDetails } from "@/types";
import { Mail, PhoneCall } from "lucide-react";

const WorldMap = dynamic(() => import("./ui/world-map"), {
  ssr: false,
  loading: () => null,
});

const Footer = () => {
  const [visible, setVisible] = useState(false);
  const [siteDetails, setSiteDetails] = useState<SiteDetails | null>(null);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (visible) return;
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

  useEffect(() => {
    apiClient.user.siteDetails.get().then((res) => {
      setSiteDetails(res);
    });
  }, []);

  return (
    <section
      ref={ref}
      className="px-3 pt-10 relative overflow-hidden border-t border-border"
    >
      <div
        className="absolute inset-0 -z-1 pointer-events-none select-none "
        aria-hidden
      >
        <div className="w-full h-full opacity-20">
          {visible ? (
            <WorldMap
              dots={[
                {
                  start: {
                    lat: 64.2008,
                    lng: -149.4937,
                  },
                  end: {
                    lat: 34.0522,
                    lng: -118.2437,
                  },
                },
                {
                  start: { lat: 64.2008, lng: -149.4937 },
                  end: { lat: -15.7975, lng: -47.8919 },
                },
                {
                  start: { lat: -15.7975, lng: -47.8919 },
                  end: { lat: 38.7223, lng: -9.1393 },
                },
                {
                  start: { lat: 51.5074, lng: -0.1278 },
                  end: { lat: 28.6139, lng: 77.209 },
                },
                {
                  start: { lat: 28.6139, lng: 77.209 },
                  end: { lat: 43.1332, lng: 131.9113 },
                },
                {
                  start: { lat: 28.6139, lng: 77.209 },
                  end: { lat: -1.2921, lng: 36.8219 },
                },
              ]}
            />
          ) : null}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-1">
          <Image
            src="/logo.png"
            alt="Logo"
            width={300}
            height={300}
            className="mb-4"
            draggable={false}
            loading="lazy"
          />
          <p className="text-accent font-semibold">
            We are a team of experts dedicated to helping you navigate the
            complexities of immigration.
          </p>
        </div>
        <div className="col-span-1 px-5">
          <h3 className="text-xl font-bold text-primary">Pages</h3>
          <hr className="border-accent w-1/2 mb-2" />
          <ul className="list-inside font-semibold">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/country">Countries</Link>
            </li>
            <li>
              <Link href="/visa">Visa</Link>
            </li>
            <li>
              <Link href="/colleges">Colleges</Link>
            </li>
            <li>
              <Link href="/contact-us">Contact Us</Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1 px-5">
          <h3 className="text-xl font-bold text-primary">Quick Links</h3>
          <hr className="border-accent w-1/2 mb-2" />
          <ul className="list-inside font-semibold">
            <li>
              <Link href="/terms">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/refund">Refund Policy</Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1 px-5">
          <h3 className="text-xl font-bold text-primary">Contact Us</h3>
          <hr className="border-accent w-1/2 mb-2" />
          <p className="font-semibold mt-2"> {siteDetails?.address}</p>
          <Link
            href={`tel:${siteDetails?.phone}`}
            className="font-semibold mt-2 text-[14px] flex items-center gap-2"
          >
            <PhoneCall className="h-5 w-5" /> {siteDetails?.phone}
          </Link>
          <Link
            href={`mailto:${siteDetails?.email}`}
            className="font-semibold mt-2 text-[14px] flex items-center gap-2"
          >
            <Mail className="h-5 w-5" /> {siteDetails?.email}
          </Link>
        </div>
      </div>
      <hr className="border-accent mt-5" />
      <div className="text-center my-4 font-semibold">
        <p>© {new Date().getFullYear()} Pentasoft. All rights reserved.</p>
      </div>
    </section>
  );
};

export default Footer;
