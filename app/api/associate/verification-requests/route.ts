import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getRequester(req: NextRequest) {
  const requesterId = req.headers.get("x-associate-id");
  if (!requesterId) return null;
  return prisma.associate.findUnique({ where: { id: requesterId } });
}

export async function GET(req: NextRequest) {
  try {
    const requester = await getRequester(req);
    if (!requester)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as
      | "PENDING"
      | "IN_REVIEW"
      | "COMPLETED"
      | "REJECTED"
      | null;
    const assignedToId = searchParams.get("assignedToId") || undefined;
    const countryId = searchParams.get("countryId") || undefined;
    const studentId = searchParams.get("studentId") || undefined;
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      50
    );
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(assignedToId ? { assignedToId } : {}),
      ...(countryId ? { countryId } : {}),
      ...(studentId ? { studentId } : {}),
    } as const;

    const [total, requests] = await Promise.all([
      prisma.documentVerificationRequest.count({ where }),
      prisma.documentVerificationRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          student: true,
          country: true,
          documents: true,
          assignedTo: true,
        },
      }),
    ]);

    return NextResponse.json({
      requests,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error listing associate verification requests:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
