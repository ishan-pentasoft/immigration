import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getStudent(req: NextRequest) {
  const studentId = req.headers.get("x-student-id");
  if (!studentId) return null;
  return prisma.student.findUnique({ where: { id: studentId } });
}

// GET /api/student/verification-requests?page=&limit=
export async function GET(req: NextRequest) {
  try {
    const student = await getStudent(req);
    if (!student)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      50
    );
    const skip = (page - 1) * limit;

    const [total, requests] = await Promise.all([
      prisma.documentVerificationRequest.count({
        where: { studentId: student.id },
      }),
      prisma.documentVerificationRequest.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          country: true,
          documents: {
            orderBy: { createdAt: "asc" },
            include: { requirement: true },
          },
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
    console.error("Error listing verification requests:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = await getStudent(req);
    if (!student)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { countryId, documents } = body || {};

    if (!countryId || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { message: "countryId and at least one document are required" },
        { status: 400 }
      );
    }

    // Validate country
    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });
    if (!country)
      return NextResponse.json(
        { message: "Country not found" },
        { status: 404 }
      );

    // Load active requirements for the country
    const requirements = await prisma.documentRequirement.findMany({
      where: { countryId, active: true },
      select: {
        id: true,
        required: true,
        maxFileSize: true,
        allowedTypes: true,
      },
    });

    const requirementsMap = new Map(requirements.map((r) => [r.id, r]));

    // Basic verification: required docs present and file constraints
    const providedByRequirement = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const doc of documents as Array<any>) {
      const r = requirementsMap.get(doc.requirementId);
      if (!r) {
        return NextResponse.json(
          { message: `Invalid requirementId: ${doc.requirementId}` },
          { status: 400 }
        );
      }
      providedByRequirement.add(doc.requirementId);
      if (
        typeof doc.fileSize !== "number" ||
        doc.fileSize <= 0 ||
        doc.fileSize > r.maxFileSize
      ) {
        return NextResponse.json(
          { message: `File size invalid for requirement ${doc.requirementId}` },
          { status: 400 }
        );
      }
      const ext = (doc.originalName || "").split(".").pop()?.toLowerCase();
      if (!ext || !r.allowedTypes.includes(ext)) {
        return NextResponse.json(
          {
            message: `File type not allowed for requirement ${doc.requirementId}`,
          },
          { status: 400 }
        );
      }
      if (!doc.fileUrl || !doc.originalName || !doc.fileName || !doc.mimeType) {
        return NextResponse.json(
          {
            message: `Document payload incomplete for requirement ${doc.requirementId}`,
          },
          { status: 400 }
        );
      }
    }

    for (const r of requirements) {
      if (r.required && !providedByRequirement.has(r.id)) {
        return NextResponse.json(
          { message: `Missing required document for requirement ${r.id}` },
          { status: 400 }
        );
      }
    }

    const created = await prisma.documentVerificationRequest.create({
      data: {
        studentId: student.id,
        countryId,
        documents: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: (documents as Array<any>).map((d) => ({
            requirementId: d.requirementId,
            studentId: student.id,
            fileName: d.fileName,
            originalName: d.originalName,
            fileUrl: d.fileUrl,
            fileSize: d.fileSize,
            mimeType: d.mimeType,
          })),
        },
      },
      include: {
        documents: true,
      },
    });

    return NextResponse.json({ request: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating verification request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
