import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const aboutUs = await prisma.aboutUs.findFirst();
    return NextResponse.json({ aboutUs });
  } catch (err) {
    console.error("GET /api/user/about-us error", err);
    return NextResponse.json(
      { error: "Failed to get about us" },
      { status: 500 }
    );
  }
}
