import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    const countryId = searchParams.get("countryId") || undefined;
    const activeParam = searchParams.get("active");
    const active = activeParam === null ? undefined : activeParam === "true";

    const requirements = await prisma.documentRequirement.findMany({
      where: {
        ...(countryId ? { countryId } : {}),
        ...(active === undefined ? {} : { active }),
      },
      orderBy: [{ countryId: "asc" }, { order: "asc" }, { title: "asc" }],
      include: {
        country: true,
        createdBy: true,
      },
    });

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error("Error listing document requirements:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (requester.role !== "DIRECTOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      countryId,
      documentType,
      title,
      description,
      required = true,
      maxFileSize = 5 * 1024 * 1024,
      allowedTypes = ["pdf", "jpg", "jpeg", "png", "doc", "docx"],
      order = 0,
      active = true,
    } = body || {};

    // Basic validation
    if (!countryId || !documentType || !title) {
      return NextResponse.json(
        { message: "countryId, documentType and title are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) {
      return NextResponse.json(
        { message: "allowedTypes must be a non-empty array" },
        { status: 400 }
      );
    }

    const created = await prisma.documentRequirement.create({
      data: {
        countryId,
        documentType,
        title,
        description,
        required,
        maxFileSize,
        allowedTypes,
        order,
        active,
        createdById: requester.id,
      },
    });

    return NextResponse.json({ requirement: created }, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating document requirement:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          message:
            "A requirement with same country, type and title already exists",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
