import React from "react";
import { WobbleCard } from "./ui/wobble-card";
import Image from "next/image";
import { Button } from "./ui/stateful-button";
import Link from "next/link";

const ServicesGrid = () => {
  return (
    <div className="px-3 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
        <WobbleCard containerClassName="col-span-1 lg:col-span-2 h-full bg-red-800">
          <div className="w-full">
            <h2 className="text-left text-balance text-lg md:text-2xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              SIGN UP FOR ONLINE VISA PROCESS
            </h2>
            <p className="mt-4 text-justify text-base/6 text-neutral-100">
              No need to visit the office again & again because you can apply
              online and enjoy hassel free process fou your Visa Application.
              Everything from uploading the documents to checking your file
              updates, you can do it from anywhere.
            </p>
          </div>
          <Image
            src="/signup.svg"
            fill
            alt="signup"
            className="pointer-events-none absolute inset-0 object-cover w-full h-full -z-1 opacity-30 grayscale filter rounded-2xl"
          />

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center"
          >
            <Button className="mt-6 bg-red-200 hover:ring-4 text-primary hover:ring-red-200 font-bold tracking-wide px-6 py-3 text-lg z-50">
              Start Now
            </Button>
          </Link>
        </WobbleCard>
        <WobbleCard containerClassName="col-span-1 h-full bg-blue-900">
          <div className="w-full">
            <h2 className="text-left text-balance text-lg md:text-2xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              Free Assessment
            </h2>
            <p className="mt-4 text-justify text-base/6 text-neutral-100">
              Let your profile get thoroughly assessed by our experts for your
              visa application. Click on below link.
            </p>
          </div>
          <Image
            src="/signup.svg"
            fill
            alt="signup"
            className="pointer-events-none absolute inset-0 object-cover w-full h-full -z-1 opacity-30 grayscale filter rounded-2xl"
          />

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center"
          >
            <Button className="mt-6 bg-blue-200 hover:ring-4 text-blue-900 hover:ring-blue-200 font-bold tracking-wide px-6 py-3 text-lg z-50">
              Click Here
            </Button>
          </Link>
        </WobbleCard>
        <WobbleCard containerClassName="col-span-1 lg:col-span-3 h-full bg-indigo-900">
          <div className="w-full">
            <h2 className="text-left text-balance text-lg md:text-2xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              Worried About Study Gap? Refused? Age 35+?
            </h2>
            <p className="mt-4 text-justify text-base/6 text-neutral-100">
              We have helped so many applicants with study gap, refused cases &
              age above 35 years to get visas successfully. If you want to be
              our success story, then contact us or visit us.
            </p>
          </div>
          <Image
            src="/signup.svg"
            fill
            alt="signup"
            className="pointer-events-none absolute inset-0 object-cover w-full h-full -z-1 opacity-30 grayscale filter rounded-2xl"
          />

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center"
          >
            <Button className="mt-6 bg-indigo-200 hover:ring-4 text-indigo-900 hover:ring-indigo-200 font-bold tracking-wide px-6 py-3 text-lg z-50">
              Schedule Now
            </Button>
          </Link>
        </WobbleCard>
      </div>
    </div>
  );
};

export default ServicesGrid;
