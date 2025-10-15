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
    if (!requester)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (requester.role !== "DIRECTOR")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const fields = await prisma.userDetailField.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ fields });
  } catch (error) {
    console.error("GET /api/associate/user-details/fields error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const requester = await getRequester(req);
    if (!requester)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (requester.role !== "DIRECTOR")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const {
      label,
      name,
      type,
      required = false,
      options,
      active = true,
    } = body ?? {};

    if (typeof label !== "string" || !label.trim()) {
      return NextResponse.json({ message: "Invalid label" }, { status: 400 });
    }
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ message: "Invalid name" }, { status: 400 });
    }
    const typeUpper = typeof type === "string" ? type.toUpperCase() : "";
    const allowed = new Set([
      "TEXT",
      "TEXTAREA",
      "NUMBER",
      "DATE",
      "SELECT",
      "RADIO",
      "CHECKBOX",
    ]);
    if (!allowed.has(typeUpper)) {
      return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    // compute next order
    const maxOrder = await prisma.userDetailField.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;

    const created = await prisma.userDetailField.create({
      data: {
        label: label.trim(),
        name: name.trim(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: typeUpper as any,
        required: Boolean(required),
        options: options ?? null,
        active: Boolean(active),
        order: nextOrder,
      },
    });
    return NextResponse.json(
      { field: created, message: "Field created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/associate/user-details/fields error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
