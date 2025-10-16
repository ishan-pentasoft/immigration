"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/api";
import type { UserDetails, UserDetailField } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = useMemo(() => String(params?.id || ""), [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetails | null>(null);
  const [fields, setFields] = useState<UserDetailField[]>([]);

  const fieldMap = useMemo(() => {
    const m = new Map<string, UserDetailField>();
    fields.forEach((f) => m.set(f.name, f));
    return m;
  }, [fields]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [d, f] = await Promise.all([
          apiClient.userDetails.getById(id),
          apiClient.userDetailsFields
            .listPublic()
            .catch(() => ({ fields: [] })),
        ]);
        if (!active) return;
        setDetail(d);
        const list = Array.isArray(f.fields) ? f.fields : [];
        setFields(
          list.filter((x) => x.active).sort((a, b) => a.order - b.order)
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        if (!active) return;
        setError("Failed to load user details");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const backHref = "/associate/applications";

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl">
          <div className="flex items-center justify-between">
            <h1 className="text-primary font-bold text-2xl tracking-wider">
              User Details
            </h1>
            <Link href={backHref}>
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer"
              >
                Back
              </Button>
            </Link>
          </div>
          <div className="mt-6">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-4">
        <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl">
          <div className="flex items-center justify-between">
            <h1 className="text-primary font-bold text-2xl tracking-wider">
              User Details
            </h1>
            <Link href={backHref}>
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer"
              >
                Back
              </Button>
            </Link>
          </div>
          <div className="mt-6 text-red-600">{error ?? "Not found"}</div>
        </div>
      </div>
    );
  }

  const extra =
    (detail as unknown as { extra?: Record<string, unknown> }).extra || {};

  return (
    <div className="p-4">
      <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-primary font-bold text-2xl tracking-wider">
            User Details
          </h1>
          <div className="flex items-center gap-2">
            <Link href={backHref}>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
              >
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Name</div>
              <div className="text-sm">{detail.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Gender</div>
              <div className="text-sm">{detail.gender}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">DOB</div>
              <div className="text-sm">
                {detail.dob
                  ? new Date(
                      detail.dob as unknown as string
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="text-sm">{detail.email}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Phone</div>
              <div className="text-sm">{detail.phone}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Nationality</div>
              <div className="text-sm">{detail.nationality}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Citizenship</div>
              <div className="text-sm">{detail.citizenship}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Country Preference
              </div>
              <div className="text-sm">{detail.countryPreference}</div>
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">Additional Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => {
                const key = f.name;
                const value = (extra as Record<string, unknown>)[key];
                if (value === undefined || value === null || value === "")
                  return null;
                const display = Array.isArray(value)
                  ? value.join(", ")
                  : String(value);
                return (
                  <div key={f.id}>
                    <div className="text-xs text-muted-foreground">
                      {f.label}
                    </div>
                    <div className="text-sm break-words">{display}</div>
                  </div>
                );
              })}
              {(() => {
                const unknowns = Object.keys(extra).filter(
                  (k) => !fieldMap.has(k)
                );
                return unknowns.map((k) => (
                  <div key={k}>
                    <div className="text-xs text-muted-foreground">{k}</div>
                    <div className="text-sm break-words">
                      {(() => {
                        const val = (extra as Record<string, unknown>)[k];
                        return Array.isArray(val)
                          ? val.join(", ")
                          : String(val);
                      })()}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
