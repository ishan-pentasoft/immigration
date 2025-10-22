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

    const requirement = await prisma.documentRequirement.findUnique({
      where: { id },
      include: { country: true, createdBy: true },
    });
    if (!requirement)
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ requirement });
  } catch (error) {
    console.error("Error fetching document requirement:", error);
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
    if (requester.role !== "DIRECTOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      countryId,
      documentType,
      title,
      description,
      required,
      maxFileSize,
      allowedTypes,
      order,
      active,
    } = body || {};

    if (
      allowedTypes !== undefined &&
      (!Array.isArray(allowedTypes) || allowedTypes.length === 0)
    ) {
      return NextResponse.json(
        { message: "allowedTypes must be a non-empty array" },
        { status: 400 }
      );
    }

    const updated = await prisma.documentRequirement.update({
      where: { id },
      data: {
        ...(countryId ? { countryId } : {}),
        ...(documentType ? { documentType } : {}),
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(required !== undefined ? { required } : {}),
        ...(maxFileSize !== undefined ? { maxFileSize } : {}),
        ...(allowedTypes !== undefined ? { allowedTypes } : {}),
        ...(order !== undefined ? { order } : {}),
        ...(active !== undefined ? { active } : {}),
      },
    });

    return NextResponse.json({ requirement: updated });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating document requirement:", error);
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const requester = await getRequester(req);
    if (!requester)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (requester.role !== "DIRECTOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;

    await prisma.documentRequirement.delete({ where: { id } });
    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error deleting document requirement:", error);
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
