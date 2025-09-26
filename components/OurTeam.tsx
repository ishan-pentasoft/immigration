"use client";

import React from "react";
import ChromaGrid, { ChromaItem } from "@/components/ui/ChromaGrid";

const teamMembers: ChromaItem[] = [
  {
    image: "https://i.pravatar.cc/300?img=15",
    title: "Aisha Khan",
    subtitle: "Senior Visa Consultant",
    handle: "@aishak",
    location: "Dubai, UAE",
    borderColor: "var(--primary)",
    gradient: "linear-gradient(160deg, var(--primary), #000)",
  },
  {
    image: "https://i.pravatar.cc/300?img=30",
    title: "Daniel Ortiz",
    subtitle: "IELTS & PTE Coach",
    handle: "@danieltutor",
    location: "Toronto, CA",
    borderColor: "var(--accent)",
    gradient: "linear-gradient(200deg, var(--accent), #000)",
  },
  {
    image: "https://i.pravatar.cc/300?img=21",
    title: "Meera Patel",
    subtitle: "University Admissions Lead",
    handle: "@meerap",
    location: "Ahmedabad, IN",
    borderColor: "oklch(0.5488 0.2944 299.0954)" /* chart-2 */,
    gradient: "linear-gradient(185deg, var(--chart-2), #000)",
  },
  {
    image: "https://i.pravatar.cc/300?img=41",
    title: "Oliver Smith",
    subtitle: "Immigration Case Manager",
    handle: "@olivers",
    location: "London, UK",
    borderColor: "oklch(0.8442 0.1457 209.2851)" /* chart-3 */,
    gradient: "linear-gradient(225deg, var(--chart-3), #000)",
  },
  {
    image: "https://i.pravatar.cc/300?img=62",
    title: "Sophia Rossi",
    subtitle: "Europe Programs Specialist",
    handle: "@sophiar",
    location: "Milan, IT",
    borderColor: "var(--ring)",
    gradient: "linear-gradient(140deg, var(--ring), #000)",
  },
  {
    image: "https://i.pravatar.cc/300?img=5",
    title: "Ahmed Ali",
    subtitle: "Scholarship Advisor",
    handle: "@ahmeda",
    location: "Doha, QA",
    borderColor: "oklch(0.9168 0.1915 101.407)" /* chart-5 */,
    gradient: "linear-gradient(145deg, var(--chart-5), #000)",
  },
];

const OurTeam = () => {
  return (
    <section className="w-full py-16 md:py-24 bg-background relative">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
          repeating-linear-gradient(45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px),
        repeating-linear-gradient(-45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px)
        `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10 md:mb-14 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary italic">
            Meet Our Team
          </h2>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Our certified consultants and coaches guide you through visas,
            admissions, and test prep with care and expertise.
          </p>
        </div>
        <ChromaGrid
          className="mx-auto max-w-[1200px]"
          items={teamMembers}
          radius={320}
          damping={0.5}
          fadeOut={0.6}
          ease="power3.out"
        />
      </div>
    </section>
  );
};

export default OurTeam;

<div className="min-h-screen w-full bg-[#fafafa] relative text-gray-900">
  {/* Diagonal Grid with Electric Orange */}
  <div
    className="absolute inset-0 z-0 pointer-events-none"
    style={{
      backgroundImage: `
          repeating-linear-gradient(45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px),
        repeating-linear-gradient(-45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px)
        `,
      backgroundSize: "40px 40px",
    }}
  />
  {/* Your Content/Components */}
</div>;
