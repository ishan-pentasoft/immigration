import { NextResponse } from "next/server";
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
    console.error("GET /api/user/site-details error", err);
    return NextResponse.json(
      { error: "Failed to load site details" },
      { status: 500 }
    );
  }
}
