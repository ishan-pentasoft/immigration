import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const search = searchParams.get("search")?.trim() || "";

    const page = Math.max(1, Number(pageParam) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitParam) || 10));
    const skip = (page - 1) * limit;

    const where: NonNullable<
      Parameters<typeof prisma.visa.findMany>[0]
    >["where"] = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const [visas, total] = await Promise.all([
      prisma.visa.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.visa.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return NextResponse.json({
      visas,
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      search: search || undefined,
    });
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
