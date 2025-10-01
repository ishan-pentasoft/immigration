import PageHeader from "@/components/PageHeader";
import { FocusCards } from "@/components/ui/focus-cards";
import React from "react";

const page = () => {
  const cards = [
    {
      title: "Australia",
      src: "/country/australia.png",
      href: "/country/australia",
    },
    {
      title: "Canada",
      src: "/country/canada.png",
      href: "/country/canada",
    },
    {
      title: "Denmark",
      src: "/country/denmark.png",
      href: "/country/denmark",
    },
    {
      title: "Germany",
      src: "/country/germany.png",
      href: "/country/germany",
    },
    {
      title: "Poland",
      src: "/country/poland.png",
      href: "/country/poland",
    },
    {
      title: "Sweden",
      src: "/country/sweden.png",
      href: "/country/sweden",
    },
    {
      title: "Switzerland",
      src: "/country/switzerland.png",
      href: "/country/switzerland",
    },
    {
      title: "United Kingdom",
      src: "/country/uk.png",
      href: "/country/uk",
    },
    {
      title: "United States",
      src: "/country/usa.png",
      href: "/country/usa",
    },
  ];

  return (
    <>
      <PageHeader text="Countries" />
      <div className="px-3">
        <FocusCards cards={cards} />
      </div>
    </>
  );
};

export default page;
