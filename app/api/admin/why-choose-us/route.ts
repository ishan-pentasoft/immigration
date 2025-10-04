import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, link } = body ?? {};

    if (!title || !description || !link) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.whyChooseUs.findUnique({ where: { title } });
    if (existing) {
      return NextResponse.json(
        { error: "Title already exists" },
        { status: 409 }
      );
    }

    const whyChooseUs = await prisma.whyChooseUs.create({
      data: { title, description, link },
    });

    return NextResponse.json({ whyChooseUs }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/why-choose-us error", error);
    return NextResponse.json(
      { error: "Failed to create why choose us" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
  try {
    const whyChooseUs = await prisma.whyChooseUs.findMany();
    return NextResponse.json({ whyChooseUs }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/why-choose-us error", error);
    return NextResponse.json(
      { error: "Failed to list why choose us" },
      { status: 500 }
    );
  }
}
