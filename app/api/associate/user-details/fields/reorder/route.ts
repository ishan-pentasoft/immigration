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

export async function PATCH(req: NextRequest) {
  try {
    const requester = await getRequester(req);
    if (!requester)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (requester.role !== "DIRECTOR")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { order } = body ?? {};
    if (
      !Array.isArray(order) ||
      order.some((id: unknown) => typeof id !== "string")
    ) {
      return NextResponse.json(
        { message: "Invalid payload. Expecting order: string[]" },
        { status: 400 }
      );
    }

    // Fetch existing IDs to validate
    const existing = await prisma.userDetailField.findMany({
      select: { id: true },
    });
    const existingIds = new Set(existing.map((f) => f.id));
    for (const id of order) {
      if (!existingIds.has(id))
        return NextResponse.json(
          { message: `Unknown id: ${id}` },
          { status: 400 }
        );
    }

    await prisma.$transaction(
      order.map((id: string, idx: number) =>
        prisma.userDetailField.update({
          where: { id },
          data: { order: idx + 1 },
        })
      )
    );

    return NextResponse.json({ success: true, message: "Reordered" });
  } catch (error) {
    console.error(
      "PATCH /api/associate/user-details/fields/reorder error",
      error
    );
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
