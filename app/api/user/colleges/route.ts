import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const search = searchParams.get("search")?.trim() || "";
    const countryId = searchParams.get("countryId") || undefined;

    const page = Math.max(1, Number(pageParam) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitParam) || 10));
    const skip = (page - 1) * limit;

    const where: NonNullable<Parameters<typeof prisma.college.findMany>[0]>["where"] = {
      ...(countryId ? { countryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { country: true },
      }),
      prisma.college.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      colleges,
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      search: search || undefined,
      countryId,
    });
  } catch (err) {
    console.error("GET /api/user/colleges error", err);
    return NextResponse.json({ error: "Failed to list colleges" }, { status: 500 });
  }
}
