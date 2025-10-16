"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import HoverCard from "@/components/HoverCard";
import OurTeam from "@/components/OurTeam";
import apiClient from "@/lib/api";
import { AboutUs, WhyChooseUs } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const [aboutUs, setAboutUs] = useState<AboutUs | null>(null);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        setLoading(true);
        const res = await apiClient.user.aboutUs.get();
        const whyChooseUs = await apiClient.user.whyChooseUs.getAll();
        setAboutUs(res);
        setWhyChooseUs(whyChooseUs);
      } catch (err) {
        console.error("Failed to fetch about us", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutUs();
  }, []);

  return (
    <div className="w-full">
      <PageHeader text="About Us" />
      <div className="w-full px-3">
        <main className="max-w-3xl mx-auto w-full border-border shadow rounded-3xl p-5">
          {loading ? (
            <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          ) : aboutUs?.imageUrl ? (
            <Image
              src={aboutUs.imageUrl}
              alt="about"
              width={600}
              height={600}
              className="aspect-[16/9] w-full rounded-2xl"
            />
          ) : (
            <div className="aspect-[16/9] w-full rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
        </main>

        {loading ? (
          <div className="ql-editor w-full mt-5 max-w-5xl mx-auto">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ) : (
          <div
            className="ql-editor w-full mt-5 max-w-5xl mx-auto"
            dangerouslySetInnerHTML={{
              __html: aboutUs?.description || "",
            }}
          />
        )}

        {whyChooseUs && (
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
                {whyChooseUs.map((item) => (
                  <HoverCard
                    title={item.title}
                    description={item.description}
                    key={item.title}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <OurTeam />
    </div>
  );
};

export default Page;
