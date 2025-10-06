"use client";

import apiClient, { SiteDetails } from "@/lib/api";
import {
  IconBrandFacebook,
  IconBrandX,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { HandHelping, Hourglass, Mail } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Topbar = () => {
  const [siteDetails, setSiteDetails] = useState<SiteDetails | null>(null);

  useEffect(() => {
    apiClient.user.siteDetails.get().then((res) => {
      setSiteDetails(res);
    });
  }, []);
  return (
    <div className="w-full md:block hidden font-bold text-white bg-accent p-3 border-b border-primary shadow-2xl sticky top-0 z-40">
      <nav
        className="max-w-7xl w-full mx-auto flex items-center justify-between"
        role="navigation"
        aria-label="Topbar navigation with contact info and social links"
      >
        {/* Contact Info */}
        <ul
          className="flex items-center justify-center gap-3"
          aria-label="Business hours and contact information"
        >
          <li className="flex gap-2 items-center justify-center">
            <Hourglass className="h-5 w-5 text-white" aria-hidden="true" />
            <span>9:30 AM To 5:30PM</span>
          </li>

          {siteDetails?.phone && (
            <Link
              href={`tel:${siteDetails.phone}`}
              className="flex gap-2 items-center justify-center rounded-md px-1 py-1"
            >
              <HandHelping className="h-6 w-6" aria-hidden="true" />
              <span>{siteDetails.phone}</span>
            </Link>
          )}

          {siteDetails?.email && (
            <Link
              href={`mailto:${siteDetails.email}`}
              className="flex gap-2 items-center justify-center rounded-md px-1 py-1"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
              <span>{siteDetails.email}</span>
            </Link>
          )}
        </ul>

        {/* Social Links */}
        <div
          className="flex items-center justify-center gap-2"
          aria-label="Social media links"
        >
          {siteDetails?.facebook && (
            <Link
              href={siteDetails.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit our ${siteDetails.facebook} profile`}
              title={siteDetails.facebook}
              className="rounded-md p-1"
            >
              <IconBrandFacebook
                size={24}
                stroke={2}
                className="text-white"
                aria-hidden="true"
              />
            </Link>
          )}
          {siteDetails?.twitter && (
            <Link
              href={siteDetails.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit our ${siteDetails.twitter} profile`}
              title={siteDetails.twitter}
              className="rounded-md p-1"
            >
              <IconBrandX
                size={24}
                stroke={2}
                className="text-white"
                aria-hidden="true"
              />
            </Link>
          )}
          {siteDetails?.youtube && (
            <Link
              href={siteDetails.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit our ${siteDetails.youtube} profile`}
              title={siteDetails.youtube}
              className="rounded-md p-1"
            >
              <IconBrandYoutube
                size={24}
                stroke={2}
                className="text-white"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Topbar;
