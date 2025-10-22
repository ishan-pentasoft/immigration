import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getStudent(req: NextRequest) {
  const studentId = req.headers.get("x-student-id");
  if (!studentId) return null;
  return prisma.student.findUnique({ where: { id: studentId } });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ countryId: string }> }
) {
  try {
    const student = await getStudent(req);
    if (!student) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { countryId } = await params;

    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });
    if (!country) {
      return NextResponse.json(
        { message: "Country not found" },
        { status: 404 }
      );
    }

    const requirements = await prisma.documentRequirement.findMany({
      where: { countryId, active: true },
      orderBy: [{ order: "asc" }, { title: "asc" }],
      select: {
        id: true,
        countryId: true,
        documentType: true,
        title: true,
        description: true,
        required: true,
        maxFileSize: true,
        allowedTypes: true,
        order: true,
        active: true,
      },
    });

    return NextResponse.json({ country, requirements });
  } catch (error) {
    console.error("Error fetching student document requirements:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
