"use client";

import PageHeader from "@/components/PageHeader";
import { FocusCards } from "@/components/ui/focus-cards";
import apiClient from "@/lib/api";
import { Country } from "@/types";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const res = await apiClient.user.countries.list();
        setCountries(res?.countries ?? []);
      } catch (err) {
        console.error("Failed to fetch countries", err);
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const cards = countries.map((country) => {
    return {
      title: country.title,
      src: country.imageUrl || " ",
      href: `/country/${country.slug}`,
    };
  });

  return (
    <>
      <PageHeader text="Countries" />
      <div className="px-3">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : countries.length > 0 ? (
          <FocusCards cards={cards} />
        ) : (
          <div className="text-muted-foreground text-center py-10">
            No countries available.
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
