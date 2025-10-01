"use client";
import React from "react";
import { TextRoll } from "./ui/text-roll";

const PageHeader = () => {
  return (
    <div className="py-20 w-full relative bg-black">
      {/* Crimson Shadow Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 80, 120, 0.25), transparent 70%), #000000",
        }}
      />
      <main className="relative z-10 max-w-7xl mx-auto w-full">
        <TextRoll className="text-4xl text-center text-white">
          motion-primitives
        </TextRoll>
      </main>
    </div>
  );
};

export default PageHeader;
