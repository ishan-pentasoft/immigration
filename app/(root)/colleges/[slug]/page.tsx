import React from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const CollegesList = [
  {
    name: "Age",
    image: "/college/age.png",
  },
  {
    name: "Age",
    image: "/college/age.png",
  },
  {
    name: "Age",
    image: "/college/age.png",
  },
  {
    name: "Age",
    image: "/college/age.png",
  },
  {
    name: "Age",
    image: "/college/age.png",
  },
  {
    name: "Age",
    image: "/college/age.png",
  },
  {
    name: "Age",
    image: "/college/age.png",
  },
  {
    name: "Age",
    image: "/college/age.png",
  },
  {
    name: "Age",
    image: "/college/age.png",
  },
];

const page = () => {
  return (
    <>
      <PageHeader text="Colleges" />
      <section className="max-w-7xl mx-auto p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CollegesList.map((college, i) => (
            <Card className="pt-0 overflow-hidden group cursor-pointer" key={i}>
              <CardHeader className="p-0">
                <Image
                  src={college.image}
                  alt="Study in Canada"
                  width={500}
                  height={500}
                  className="aspect-[16/9] object-cover group-hover:scale-105 transition-all duration-300"
                />
              </CardHeader>
              <CardTitle className="px-2 text-2xl truncate text-primary font-semibold">
                {college.name}
              </CardTitle>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
};

export default page;
