"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import apiClient, { Country, College } from "@/lib/api";

export default function Page() {
  const { countrySlug, collegeSlug } = useParams();

  const [loading, setLoading] = useState(false);
  const [college, setCollege] = useState<(College & { country?: Country }) | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.user.colleges.getBySlug(String(collegeSlug));
        setCollege(data);
      } catch (err) {
        console.error("Failed to fetch college:", err);
        setError("Failed to load college");
      } finally {
        setLoading(false);
      }
    };
    if (collegeSlug) fetchCollege();
  }, [collegeSlug]);

  return (
    <>
      <PageHeader text={college?.name || "College"} />
      <section className="max-w-5xl mx-auto p-3">
        <div className="mb-4 text-sm">
          <Link
            href={`/colleges/${String(countrySlug || college?.country?.slug || "")}`}
            className="text-primary hover:underline"
          >
            ← Back to colleges
          </Link>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : college ? (
          <Card>
            <CardHeader>
              <CardTitle>{college.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {college.imageUrl ? (
                <Image
                  src={college.imageUrl}
                  alt={college.name}
                  width={1200}
                  height={675}
                  className="w-full h-auto rounded-md bg-accent-foreground"
                />
              ) : (
                <div className="aspect-[16/9] w-full bg-muted flex items-center justify-center text-muted-foreground rounded-md">
                  No image available
                </div>
              )}
              <p className="text-muted-foreground whitespace-pre-wrap">
                {college.description}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="text-muted-foreground">College not found.</div>
        )}
      </section>
    </>
  );
}
