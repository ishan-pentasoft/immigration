import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const visas = await prisma.visa.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ visas });
  } catch (err) {
    console.error("GET /api/admin/visas error", err);
    return NextResponse.json(
      { error: "Failed to list visas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, slug, imageUrl } = body ?? {};

    if (!title || !description || !slug || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.visa.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    const visa = await prisma.visa.create({
      data: { title, description, slug, imageUrl },
    });

    return NextResponse.json({ visa }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/visas error", err);
    return NextResponse.json(
      { error: "Failed to create visa" },
      { status: 500 }
    );
  }
}
