import React from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/stateful-button";
import { PhoneCall } from "lucide-react";
import Image from "next/image";
import HoverCard from "@/components/HoverCard";
import OurTeam from "@/components/OurTeam";

const Page = () => {
  return (
    <div className="w-full">
      <PageHeader text="About Us" />
      <div className="w-full px-3">
        <main className="max-w-7xl mx-auto w-full">
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
                India, Google for &quot; Immigration Company for Canada or
                India, leading in society Immigration &quot; get 50 million
                results in pure 3 seconds! Pentasoft Professional Pvt. Ltd. is
                the one of those millions of immigration companies in India and
                may not even appear on the first page of search results.
                However, you are here in yours Search for your dream education
                and career abroad.
              </p>
              <p className="text-justify my-3">
                Basically on the grounds that, you have been suggested by your
                companion or a family member or an individual partner who has as
                of now benefited Immigration and Education Consulting
                administrations from Pentasoft Professional. Pentasoft
                Professional as of now made a number of success stories; that is
                the thing that brings you here. This is the thing that separates
                us from other million migration organizations in India – it is
                our work that represents us with no issue.
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
              We put you first. We come at the situation from your perspective.
              We see the fantasies you see; we think about the entirety of your
              constraints, and we have full consideration for your pocket. We
              are here to work on the movement and worldwide schooling measure
              with the goal that your fantasies can materialize. We are here to
              see our accomplishment in your prosperity. We are here.
              Continuously.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-10 my-5">
            <Button className="bg-primary hover:ring-2 hover:ring-primary font-bold tracking-wide px-6 py-3 text-lg">
              More Details
            </Button>
            <p className="text-xl font-bold flex gap-3">
              <PhoneCall className="stroke-primary" /> +91-8283-994-938
            </p>
          </div>
        </main>

        <div className="pt-10 pb-3 max-w-7xl mx-auto border shadow rounded-3xl relative mt-10">
          {/*  Diagonal Cross Grid Top Background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `
        linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
        linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)
      `,
              backgroundSize: "40px 40px",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
              maskImage:
                "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
            }}
          />

          <div className="flex flex-col items-center relative z-10 justify-center gap-4 ">
            <h1 className="text-[12px] py-2 px-6 border shadow rounded-3xl bg-muted text-primary font-bold">
              WHO WE ARE
            </h1>
            <h1 className="text-2xl font-bold text-center text-balance max-w-2xl ">
              What Makes Us Different From Other Immigration Consultants
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-5 px-3">
              <HoverCard
                title="Apply Your Visa Online"
                description="You can process your visa application with our experienced registered agents without visiting office in-person. Yes! you heard right, now we are providing online platform and an application o sign in your visa application right from your mobile phone or pc. Download our application from android PlayStore or Iphone App Store."
              />
              <HoverCard
                title="Transparent Process"
                description="We provide transparent system of application  processing from start to end. No burden of hidden charges, extra payments, funds problem etc. All paymets made directly to concerned institutions by students from their acounts or debit/credit cards & required documents are uploaded on our online portal where applicants can check their profile anytime."
              />
              <HoverCard
                title="Study Gap Acceptable"
                description="Study Gap of up to 15 years or more!!! No matter if you dropped or sacrificed your studies for any issues, we are here to help you apply your application to Study Abroad. Our experts will assess your profile & provide options to study in your dream country."
              />
              <HoverCard
                title="Application Tracking"
                description="
            We are facilitating our clients with access to their applications right from their palm using their mobiles and personal computers. They can track real time status of their application and can request for immediate updates by chat, call and email option in their Pentasoft Professional Portal."
              />
              <HoverCard
                title="Program Guidance For Permanent Residence"
                description="Our expert counsellers provide program selection and guidance to chose Institution for their betterment of the client in which they can get their Permanent Residence with 1 year of studies at Reputed Institution."
              />
              <HoverCard
                title="Welcome to Refused Applicants"
                description="Our expert team is always ready to help refused applicants to re-apply their applications with required changes to make their dream a reality. Contact us if you are the one of them."
              />
            </div>
          </div>
        </div>
      </div>
      <OurTeam />
    </div>
  );
};

export default Page;
