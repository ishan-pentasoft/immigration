import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getRequester(req: NextRequest) {
  const requesterId = req.headers.get("x-associate-id");
  if (!requesterId) return null;
  const requester = await prisma.associate.findUnique({
    where: { id: requesterId },
  });
  return requester;
}

export async function GET(req: NextRequest) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const search = searchParams.get("search")?.trim() || "";
    const associateIdParam = searchParams.get("associateId")?.trim() || "";
    const statusParam = searchParams.get("status");

    const page = Math.max(1, Number(pageParam) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitParam) || 10));
    const skip = (page - 1) * limit;

    const isDirector = requester.role === "DIRECTOR";

    const whereBase: NonNullable<
      Parameters<typeof prisma.staffTasks.findMany>[0]
    >["where"] = {
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
      ...(statusParam === "true"
        ? { status: true }
        : statusParam === "false"
        ? { status: false }
        : {}),
    };

    const where: NonNullable<
      Parameters<typeof prisma.staffTasks.findMany>[0]
    >["where"] = {
      ...whereBase,
      ...(isDirector
        ? associateIdParam
          ? { associateId: associateIdParam }
          : {}
        : { associateId: requester.id }),
    };

    const [tasks, total] = await Promise.all([
      prisma.staffTasks.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.staffTasks.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return NextResponse.json({
      tasks,
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      search: search || undefined,
      associateId: isDirector ? associateIdParam || undefined : requester.id,
      status:
        statusParam === "true"
          ? true
          : statusParam === "false"
          ? false
          : undefined,
    });
  } catch (err) {
    console.error("GET /api/associate/staff-tasks error", err);
    return NextResponse.json(
      { error: "Failed to list staff tasks" },
      { status: 500 }
    );
  }
}
