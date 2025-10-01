"use client";

import PageHeader from "@/components/PageHeader";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

const visaList = [
  {
    name: "Canada Study Visa",
    image: "/visa/Study in Canada.png",
    description: "Study in Canada",
  },
  {
    name: "UK Study Visa",
    image: "/visa/ukstudy.png",
    description: "Study in United Kingdom",
  },
  {
    name: "Australia Study Visa",
    image: "/visa/Study in Australia.png",
    description: "Study in Australia",
  },
  {
    name: "Europe Study Visa",
    image: "/visa/study-in-europe.jpg",
    description: "Study in Europe",
  },
  {
    name: "USA Study Visa",
    image: "/visa/usa study visa.jpg",
    description: "Study in USA",
  },
  {
    name: "Canada Visitor / Tourist Visa",
    image: "/visa/canada visitor.png",
    description:
      "Visiting Canada is More Convenient Now jksdf ksdjf ksjdf ksdf kn sdsa alksnd lkasd ",
  },
  {
    name: "Australia Visitor / Tourist Visa",
    image: "/visa/Australia Tourist Visa.png",
    description: "Visit Australia without IELTS",
  },
  {
    name: "USA Visitor / Tourist Visa",
    image: "/visa/USA visitor visa.jpg",
    description: "Visit USA.",
  },
];

const Page = () => {
  const router = useRouter();

  return (
    <>
      <PageHeader text="Visa" />
      <section className="max-w-7xl mx-auto p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visaList.map((visa) => (
            <Card
              className="pt-0 overflow-hidden group cursor-pointer"
              key={visa.name}
              onClick={() => router.push(`/visa/${visa.name}`)}
            >
              <CardHeader className="p-0">
                <Image
                  src={visa.image}
                  alt="Study in Canada"
                  width={500}
                  height={500}
                  className="aspect-[16/9] object-cover group-hover:scale-105 transition-all duration-300"
                />
              </CardHeader>
              <CardTitle className="px-2 text-2xl truncate text-primary font-semibold">
                {visa.name}
              </CardTitle>
              <CardDescription className="px-2 text-sm">
                {visa.description}
              </CardDescription>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
};

export default Page;
