"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { College } from "@/lib/api";
import Image from "next/image";

export default function Page() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const run = async () => {
      try {
        const c = await apiClient.admin.colleges.getBySlug(slug);
        setCollege(c);
      } catch (err: unknown) {
        console.error("Failed to fetch college:", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [slug]);

  return (
    <section className="min-h-screen p-10">
      <div className="border-slate-500 shadow-xl bg-muted rounded-lg h-full w-full p-4">
        <Button
          className="font-bold cursor-pointer hover:text-white"
          variant={"outline"}
          onClick={() => router.back()}
        >
          Back
        </Button>
        {loading && (
          <div className=" flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-purple-500"></div>
            <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-red-500 ml-3"></div>
            <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-blue-500 ml-3"></div>
          </div>
        )}
        {college && !loading && college.imageUrl && (
          <Image
            src={college.imageUrl}
            alt={college.name}
            width={300}
            height={300}
            className="object-contain bg-background mx-auto aspect-auto mt-5 rounded-2xl shadow-lg"
          />
        )}
        <div className="mt-5">
          <h2 className="text-2xl font-bold text-primary">{college?.name}</h2>
          {college && (
            <div
              className="ql-editor w-full mt-5"
              dangerouslySetInnerHTML={{ __html: college?.description || "" }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
