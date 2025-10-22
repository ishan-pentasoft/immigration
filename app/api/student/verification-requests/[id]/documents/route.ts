import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getStudent(req: NextRequest) {
  const studentId = req.headers.get("x-student-id");
  if (!studentId) return null;
  return prisma.student.findUnique({ where: { id: studentId } });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const student = await getStudent(req);
    if (!student) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      requirementId,
      parentDocumentId,
      fileUrl,
      originalName,
      fileName,
      fileSize,
      mimeType,
    } = body || {};
    const { id } = await params;

    if (
      !requirementId ||
      !fileUrl ||
      !originalName ||
      !fileName ||
      !fileSize ||
      !mimeType
    ) {
      return NextResponse.json(
        {
          message:
            "requirementId, fileUrl, originalName, fileName, fileSize and mimeType are required",
        },
        { status: 400 }
      );
    }

    const request = await prisma.documentVerificationRequest.findFirst({
      where: {
        id,
        studentId: student.id,
      },
      select: { id: true, countryId: true },
    });

    if (!request) {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    const requirement = await prisma.documentRequirement.findFirst({
      where: {
        id: requirementId,
        countryId: request.countryId,
        active: true,
      },
      select: { id: true, maxFileSize: true, allowedTypes: true },
    });

    if (!requirement) {
      return NextResponse.json(
        { message: "Invalid requirement" },
        { status: 400 }
      );
    }

    if (
      typeof fileSize !== "number" ||
      fileSize <= 0 ||
      fileSize > requirement.maxFileSize
    ) {
      return NextResponse.json(
        { message: "File size invalid" },
        { status: 400 }
      );
    }

    const ext = (originalName || "").split(".").pop()?.toLowerCase();
    if (!ext || !requirement.allowedTypes.includes(ext)) {
      return NextResponse.json(
        { message: "File type not allowed" },
        { status: 400 }
      );
    }

    let document;
    if (parentDocumentId) {
      const existing = await prisma.studentDocument.findFirst({
        where: {
          id: parentDocumentId,
          verificationRequestId: id,
          studentId: student.id,
        },
      });
      if (!existing) {
        return NextResponse.json(
          { message: "Parent document not found" },
          { status: 404 }
        );
      }
      if (existing.requirementId !== requirementId) {
        return NextResponse.json(
          { message: "Requirement mismatch for replacement" },
          { status: 400 }
        );
      }

      document = await prisma.studentDocument.update({
        where: { id: parentDocumentId },
        data: {
          fileName,
          originalName,
          fileUrl,
          fileSize,
          mimeType,
          status: "PENDING",
          reviewNotes: null,
          rejectionReason: null,
          reviewedAt: null,
          reviewedById: null,
        },
      });
    } else {
      document = await prisma.studentDocument.create({
        data: {
          requirementId,
          verificationRequestId: id,
          studentId: student.id,
          parentDocumentId: undefined,
          fileName,
          originalName,
          fileUrl,
          fileSize,
          mimeType,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Error adding verification document:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
