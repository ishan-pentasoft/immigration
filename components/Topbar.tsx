import { socialLinks } from "@/constants";
import { HandHelping, Hourglass, Mail } from "lucide-react";
import Link from "next/link";
import React from "react";
import { StickyBanner } from "./ui/sticky-banner";

const Topbar = () => {
  return (
    <StickyBanner className="w-full md:block hidden font-bold text-white bg-accent p-3 border-b border-primary shadow-2xl">
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

          <Link
            href="tel:+918800813814"
            className="flex gap-2 items-center justify-center rounded-md px-1 py-1"
          >
            <HandHelping className="h-6 w-6" aria-hidden="true" />
            <span>+91 8800 813 814</span>
          </Link>

          <Link
            href="mailto:leads.rightlinks@gmail.com"
            className="flex gap-2 items-center justify-center rounded-md px-1 py-1"
          >
            <Mail className="h-5 w-5" aria-hidden="true" />
            <span>leads.rightlinks@gmail.com</span>
          </Link>
        </ul>

        {/* Social Links */}
        <div
          className="flex items-center justify-center gap-2"
          aria-label="Social media links"
        >
          {socialLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${item.link} profile`}
                title={item.link}
                className="rounded-md p-1"
              >
                <Icon
                  size={24}
                  stroke={2}
                  className="text-white"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </StickyBanner>
  );
};

export default Topbar;
