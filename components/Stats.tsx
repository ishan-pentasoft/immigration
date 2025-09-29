"use client";
import React from "react";
import { AnimatedCounter } from "./ui/animated-counter";

const Stats = () => {
  const stats = [
    { title: "Colleges", count: 500, duration: 2.5, suffix: "+" },
    { title: "Universities", count: 357, duration: 2.5, suffix: "+" },
    { title: "Diploma Programs", count: 2000, duration: 2.5, suffix: "+" },
    { title: "Degree Programs", count: 1500, duration: 2.5, suffix: "+" },
    { title: "Certificate Programs", count: 1200, duration: 2.5, suffix: "+" },
    {
      title: "Advance Diploma Programs",
      count: 800,
      duration: 2.5,
      suffix: "+",
    },
    {
      title: "Post Graduate Programs",
      count: 1600,
      duration: 2.5,
      suffix: "+",
    },
    {
      title: "Masters Degree Programs",
      count: 950,
      duration: 2.5,
      suffix: "+",
    },
  ];

  return (
    <div className="py-20 w-full bg-black relative overflow-hidden">
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

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-lg"
            >
              <AnimatedCounter
                end={stat.count}
                duration={stat.duration}
                suffix={stat.suffix}
              />
              <h3 className="text-white text-lg font-semibold mb-2 text-center">
                {stat.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
