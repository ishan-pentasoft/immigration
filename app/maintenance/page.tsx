import React from "react";

async function getSiteDetails() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/user/site-details`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.siteDetails as {
      maintenanceMessage?: string | null;
    } | null;
  } catch {
    return null;
  }
}

export default async function MaintenancePage() {
  const details = await getSiteDetails();
  const message =
    details?.maintenanceMessage?.trim() ||
    "We're currently undergoing scheduled maintenance. We'll be back shortly.";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-muted/20">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold mb-4">We&apos;ll be back soon</h1>
        <p className="text-muted-foreground leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
