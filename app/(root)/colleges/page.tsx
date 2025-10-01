import PageHeader from "@/components/PageHeader";
import { FocusCards } from "@/components/ui/focus-cards";
import React from "react";

const page = () => {
  const cards = [
    {
      title: "Australia",
      src: "/country/australia.png",
      href: "/colleges/australia",
    },
    {
      title: "Canada",
      src: "/country/canada.png",
      href: "/colleges/canada",
    },
    {
      title: "Denmark",
      src: "/country/denmark.png",
      href: "/colleges/denmark",
    },
    {
      title: "Germany",
      src: "/country/germany.png",
      href: "/colleges/germany",
    },
    {
      title: "Poland",
      src: "/country/poland.png",
      href: "/colleges/poland",
    },
    {
      title: "Sweden",
      src: "/country/sweden.png",
      href: "/colleges/sweden",
    },
    {
      title: "Switzerland",
      src: "/country/switzerland.png",
      href: "/colleges/switzerland",
    },
    {
      title: "United Kingdom",
      src: "/country/uk.png",
      href: "/colleges/uk",
    },
    {
      title: "United States",
      src: "/country/usa.png",
      href: "/colleges/usa",
    },
  ];

  return (
    <>
      <PageHeader text="Colleges" />
      <div className="px-3">
        <FocusCards cards={cards} />
      </div>
    </>
  );
};

export default page;
