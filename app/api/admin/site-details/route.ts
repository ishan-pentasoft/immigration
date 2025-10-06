import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const details = await prisma.siteDetails.upsert({
      where: { id: "site" },
      update: {},
      create: { id: "site" },
    });
    return NextResponse.json({ siteDetails: details });
  } catch (err) {
    console.error("GET /api/admin/site-details error", err);
    return NextResponse.json(
      { error: "Failed to load site details" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, email, facebook, twitter, youtube, address } = body ?? {};

    const updated = await prisma.siteDetails.update({
      where: { id: "site" },
      data: {
        phone: phone ?? null,
        email: email ?? null,
        facebook: facebook ?? null,
        twitter: twitter ?? null,
        youtube: youtube ?? null,
        address: address ?? null,
      },
    });

    return NextResponse.json({ siteDetails: updated });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err?.code === "P2025") {
      try {
        const body = await req.json();
        const { phone, email, facebook, twitter, youtube, address } =
          body ?? {};
        const created = await prisma.siteDetails.create({
          data: {
            id: "site",
            phone: phone ?? null,
            email: email ?? null,
            facebook: facebook ?? null,
            twitter: twitter ?? null,
            youtube: youtube ?? null,
            address: address ?? null,
          },
        });
        return NextResponse.json({ siteDetails: created });
      } catch (e) {
        console.error("PUT(create) /api/admin/site-details error", e);
        return NextResponse.json(
          { error: "Failed to create site details" },
          { status: 500 }
        );
      }
    }

    console.error("PUT /api/admin/site-details error", err);
    return NextResponse.json(
      { error: "Failed to update site details" },
      { status: 500 }
    );
  }
}
