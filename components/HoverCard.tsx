"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { TicketsPlane } from "lucide-react";

const HoverCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="py-10 overflow-hidden bg-black w-full px-8 relative space-y-4 rounded-2xl"
    >
      <h1 className="text-2xl text-center text-primary font-bold relative z-20 ">
        {title}
      </h1>
      <p className="text-md font-medium text-justify text-white relative z-20">
        {description}
      </p>
      <TicketsPlane className="w-full h-full absolute inset-0 stroke-white opacity-10" />
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full absolute inset-0"
          >
            <CanvasRevealEffect
              animationSpeed={5}
              containerClassName="bg-transparent"
              colors={[
                [59, 130, 246],
                [139, 92, 246],
              ]}
              opacities={[0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 1]}
              dotSize={10}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Radial gradient for the cute fade */}
      <div className="absolute inset-0 [mask-image:radial-gradient(400px_at_center,white,transparent)] bg-black/50 dark:bg-black/90" />
    </div>
  );
};

export default HoverCard;
