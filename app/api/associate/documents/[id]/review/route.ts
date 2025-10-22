import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getRequester(req: NextRequest) {
  const requesterId = req.headers.get("x-associate-id");
  if (!requesterId) return null;
  return prisma.associate.findUnique({ where: { id: requesterId } });
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
    const { status, reviewNotes, rejectionReason } = body || {};

    if (
      !status ||
      !["APPROVED", "REJECTED", "RESUBMISSION_REQUIRED"].includes(status)
    ) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const doc = await prisma.studentDocument.findUnique({
      where: { id },
      select: { id: true, verificationRequestId: true },
    });
    if (!doc)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    const updated = await prisma.studentDocument.update({
      where: { id },
      data: {
        status,
        reviewNotes: reviewNotes ?? null,
        rejectionReason:
          status === "REJECTED" || status === "RESUBMISSION_REQUIRED"
            ? rejectionReason ?? null
            : null,
        reviewedById: requester.id,
        reviewedAt: new Date(),
      },
      include: { requirement: true, student: true, reviewedBy: true },
    });

    const allDocs = await prisma.studentDocument.findMany({
      where: { verificationRequestId: doc.verificationRequestId },
      select: { status: true },
    });
    const hasRejectOrResubmit = allDocs.some((d) =>
      ["REJECTED", "RESUBMISSION_REQUIRED"].includes(d.status as string)
    );
    const allApproved =
      allDocs.length > 0 && allDocs.every((d) => d.status === "APPROVED");
    const newRequestStatus = hasRejectOrResubmit
      ? "REJECTED"
      : allApproved
      ? "COMPLETED"
      : "IN_REVIEW";

    await prisma.documentVerificationRequest.update({
      where: { id: doc.verificationRequestId },
      data: {
        status: newRequestStatus,
        ...(requester ? { assignedToId: requester.id } : {}),
      },
    });

    return NextResponse.json({ document: updated });
  } catch (error) {
    console.error("Error reviewing document:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
