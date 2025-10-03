import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const aboutUs = await prisma.aboutUs.findFirst();
    return NextResponse.json({ aboutUs });
  } catch (err) {
    console.error("GET /api/admin/about-us error", err);
    return NextResponse.json(
      { error: "Failed to get about us" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const existing = await prisma.aboutUs.findFirst();
    if (existing) {
      return NextResponse.json(
        { error: "About Us already exists. Use update instead." },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { description, imageUrl } = body ?? {};

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "'description' is required" },
        { status: 400 }
      );
    }

    const aboutUs = await prisma.aboutUs.create({
      data: { description, imageUrl: imageUrl ?? null },
    });

    return NextResponse.json({ aboutUs });
  } catch (err) {
    console.error("POST /api/admin/about-us error", err);
    return NextResponse.json(
      { error: "Failed to create about us" },
      { status: 500 }
    );
  }
}
