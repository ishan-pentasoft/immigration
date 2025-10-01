import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/stateful-button";
import { PhoneCall } from "lucide-react";
import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <div className="w-full">
      <PageHeader text="About Us" />
      <main className="max-w-7xl mx-auto w-full px-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 ">
          <div className="w-full">
            <h1 className="text-2xl text-balance text-center sm:text-left font-bold text-primary">
              About Pentasoft Professional Pvt. Ltd.
            </h1>
            <h1 className="text-3xl text-balance mt-3 font-bold text-gray-500">
              Experienced Team Providing Quality Services
            </h1>
            <p className="text-justify my-3">
              When candidates like you, who are commited to making a thriving
              race abroud and aspiring to win the name, fame and money outside
              India, Google for &quot; Immigration Company for Canada or India,
              leading in society Immigration &quot; get 50 million results in
              pure 3 seconds! Pentasoft Professional Pvt. Ltd. is the one of
              those millions of immigration companies in India and may not even
              appear on the first page of search results. However, you are here
              in yours Search for your dream education and career abroad.
            </p>
            <p className="text-justify my-3">
              Basically on the grounds that, you have been suggested by your
              companion or a family member or an individual partner who has as
              of now benefited Immigration and Education Consulting
              administrations from Pentasoft Professional. Pentasoft
              Professional as of now made a number of success stories; that is
              the thing that brings you here. This is the thing that separates
              us from other million migration organizations in India – it is our
              work that represents us with no issue.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="/about.png"
              alt="about"
              height={600}
              width={600}
              className="object-contain rounded-3xl"
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 my-4">
          <h1 className="text-primary font-bold">Our Promise:</h1>
          <p className="text-justify">
            We put you first. We come at the situation from your perspective. We
            see the fantasies you see; we think about the entirety of your
            constraints, and we have full consideration for your pocket. We are
            here to work on the movement and worldwide schooling measure with
            the goal that your fantasies can materialize. We are here to see our
            accomplishment in your prosperity. We are here. Continuously.
          </p>
        </div>
        <div className="flex items-center justify-center gap-10 my-5">
          <Button className="bg-primary hover:ring-2 hover:ring-primary font-bold tracking-wide px-6 py-3 text-lg">
            More Details
          </Button>
          <p className="text-xl font-bold flex gap-3">
            <PhoneCall className="stroke-primary" /> +91-8283-994-938
          </p>
        </div>
      </main>
    </div>
  );
};

export default page;
