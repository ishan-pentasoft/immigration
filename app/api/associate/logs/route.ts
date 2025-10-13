import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get("associateToken")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      associateId: string;
      role?: string;
    };

    const me = await prisma.associate.findUnique({
      where: { id: decoded.associateId },
      select: { id: true, role: true },
    });

    if (!me || me.role !== "DIRECTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(
      1,
      Math.min(100, Number(searchParams.get("limit") || 10))
    );
    const search = (searchParams.get("search") || "").trim();

    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" as const } },
            { ip: { contains: search, mode: "insensitive" as const } },
            { userAgent: { contains: search, mode: "insensitive" as const } },
            { message: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [total, logs] = await Promise.all([
      prisma.associateLoginLog.count({ where }),
      prisma.associateLoginLog.findMany({
        where,
        include: { associate: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json(
      {
        logs,
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        search: search || undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
