import React from "react";
import { AnimatedShinyText } from "./ui/animated-shiny-text";
import { Marquee } from "./ui/marquee";
import Image from "next/image";

const colleges = [
  "/college/age.png",
  "/college/aun.png",
  "/college/chi.png",
  "/college/fan.png",
  "/college/gary.png",
  "/college/mo.png",
  "/college/nc.png",
  "/college/pac.png",
  "/college/patta.png",
  "/college/pits.png",
  "/college/sity.png",
];

const PartneredWith = () => {
  return (
    <section className="px-3 py-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Text */}
        <div className="text-start flex flex-col space-y-4 items-start justify-center">
          <div className="group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800">
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300">
              <span className="font-bold">✨ Partnered With</span>
            </AnimatedShinyText>
          </div>

          <h1 className="text-4xl md:text-6xl text-accent italic font-semibold text-balance md:leading-16">
            We partner with colleges of all around the world
          </h1>
        </div>

        {/* Right Marqee */}
        <div className="relative flex h-96 w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px]">
          <div
            className="flex flex-row items-center gap-4"
            style={{
              transform:
                "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
            }}
          >
            <Marquee pauseOnHover vertical className="[--duration:20s]">
              {colleges.map((college) => (
                <Image
                  src={college}
                  alt="College"
                  key={college}
                  width={100}
                  height={100}
                />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:10s]" vertical>
              {colleges.map((college) => (
                <Image
                  src={college}
                  alt="College"
                  key={college}
                  width={100}
                  height={100}
                />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
              {colleges.map((college) => (
                <Image
                  src={college}
                  alt="College"
                  key={college}
                  width={100}
                  height={100}
                />
              ))}
            </Marquee>
            <Marquee pauseOnHover className="[--duration:20s]" vertical>
              {colleges.map((college) => (
                <Image
                  src={college}
                  alt="College"
                  key={college}
                  width={100}
                  height={100}
                />
              ))}
            </Marquee>
            <div className="from-background pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b"></div>
            <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t"></div>
            <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
            <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartneredWith;
