"use client";
import React, { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import apiClient from "@/lib/api";
import { ListCollegesResponse } from "@/types";
import { useParams } from "next/navigation";
import Link from "next/link";

const Page = () => {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState<ListCollegesResponse["colleges"]>(
    []
  );

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        setLoading(true);
        const country = await apiClient.user.countries.getBySlug(
          slug as string
        );

        setColleges(country?.colleges || []);
      } catch (err) {
        console.error("Failed to fetch country:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCountry();
  }, [slug]);

  if (loading) {
    return (
      <>
        <PageHeader text="Colleges" />
        <section className="max-w-7xl mx-auto p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card className="pt-0 overflow-hidden" key={i}>
                <div className="w-full aspect-[16/9] bg-muted animate-pulse" />
                <div className="px-2 py-3">
                  <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </>
    );
  }

  if (!colleges.length) {
    return (
      <>
        <PageHeader text="Colleges" />
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">No colleges found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader text="Colleges" />
      <section className="max-w-7xl mx-auto p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colleges.map((college, i) => (
            <Link href={`/college-details/${college.slug}`} key={i}>
              <Card className="pt-0 overflow-hidden group cursor-pointer">
                <CardHeader className="p-0">
                  {college.imageUrl ? (
                    <Image
                      src={college.imageUrl}
                      alt={college.name}
                      width={500}
                      height={500}
                      className="aspect-[16/9] object-contain bg-accent-foreground group-hover:scale-105 transition-all duration-300"
                    />
                  ) : (
                    <div className="aspect-[16/9] bg-muted flex items-center justify-center text-muted-foreground">
                      No image available
                    </div>
                  )}
                </CardHeader>
                <CardTitle className="px-2 text-2xl truncate text-primary font-semibold">
                  {college.name}
                </CardTitle>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default Page;
