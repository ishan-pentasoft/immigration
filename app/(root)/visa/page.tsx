"use client";

import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { Visa } from "@/types";

const Page = () => {
  const router = useRouter();

  const [visas, setVisas] = useState<Visa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    (async () => {
      try {
        const res = await apiClient.user.visas.list();
        if (isMounted) setVisas(res.visas);
      } catch (err) {
        console.error("Failed to fetch visas:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader text="Visa" />
      <section className="max-w-7xl mx-auto p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card className="pt-0 overflow-hidden" key={i}>
                  <div className="w-full aspect-[16/9] bg-muted animate-pulse" />
                  <div className="px-2 py-3">
                    <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                  </div>
                </Card>
              ))
            : visas.map((visa) => (
                <Card
                  className="pt-0 overflow-hidden group cursor-pointer"
                  key={visa.id}
                  onClick={() => router.push(`/visa/${visa.slug}`)}
                >
                  <CardHeader className="p-0">
                    <Image
                      src={visa.imageUrl ?? ""}
                      alt={visa.title}
                      width={500}
                      height={500}
                      className="aspect-[16/9] object-cover group-hover:scale-105 transition-all duration-300"
                    />
                  </CardHeader>
                  <CardTitle className="px-2 text-2xl truncate text-primary font-semibold">
                    {visa.title}
                  </CardTitle>
                </Card>
              ))}
        </div>
      </section>
    </>
  );
};

export default Page;
