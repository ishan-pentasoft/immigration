import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getRequester(req: NextRequest) {
  const requesterId = req.headers.get("x-associate-id");
  if (!requesterId) return null;
  return prisma.associate.findUnique({ where: { id: requesterId } });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const requester = await getRequester(req);
    if (!requester)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const requestItem = await prisma.documentVerificationRequest.findUnique({
      where: { id },
      include: {
        student: true,
        country: true,
        documents: {
          include: { reviewedBy: true, requirement: true },
          orderBy: { createdAt: "asc" },
        },
        assignedTo: true,
        reviewedBy: true,
      },
    });

    if (!requestItem)
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ request: requestItem });
  } catch (error) {
    console.error("Error fetching verification request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const requester = await getRequester(req);
    if (!requester)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { assignedToId, status, reviewNotes } = body || {};

    if (assignedToId !== undefined && requester.role !== "DIRECTOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (
      status !== undefined &&
      !["PENDING", "IN_REVIEW", "COMPLETED", "REJECTED"].includes(status)
    ) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }
    if (
      status !== undefined &&
      !["PENDING", "IN_REVIEW", "COMPLETED", "REJECTED"].includes(status)
    ) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const current = await prisma.documentVerificationRequest.findUnique({
      where: { id },
      select: { assignedToId: true, status: true },
    });
    if (!current)
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (assignedToId !== undefined) data.assignedToId = assignedToId || null;
    if (reviewNotes !== undefined) data.reviewNotes = reviewNotes;
    if (status !== undefined) data.status = status;

    if (status === "IN_REVIEW" && !current.assignedToId) {
      data.assignedToId = requester.id;
    }

    if (
      (status === "COMPLETED" || status === "REJECTED") &&
      !current.assignedToId
    ) {
      data.assignedToId = requester.id;
    }

    if (status === "COMPLETED" || status === "REJECTED") {
      data.reviewedById = requester.id;
      data.reviewedAt = new Date();
    }

    const updated = await prisma.documentVerificationRequest.update({
      where: { id },
      data,
      include: { assignedTo: true, reviewedBy: true },
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("Error updating verification request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
