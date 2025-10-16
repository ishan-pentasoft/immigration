"use client";

import React, { useEffect, useState } from "react";
import ChromaGrid from "@/components/ui/ChromaGrid";
import apiClient from "@/lib/api";
import { Team } from "@/types";

const OurTeam = () => {
  const [teamMembers, setTeamMembers] = useState<Team[]>([]);

  useEffect(() => {
    apiClient.user.team.getAll().then((res) => {
      setTeamMembers(res);
    });
  }, []);

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
          items={teamMembers.map((member) => ({
            image: member.imageUrl!,
            title: member.name,
            subtitle: member.title,
            borderColor: "var(--primary)",
            gradient: "linear-gradient(160deg, var(--primary), #000)",
          }))}
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
</div>;
