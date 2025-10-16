import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "id is required in the URL" },
        { status: 400 }
      );
    }

    const detail = await prisma.userDetails.findUnique({
      where: { id },
      include: {
        values: {
          include: { field: true },
        },
        associate: true,
      },
    });

    if (!detail) {
      return NextResponse.json(
        { message: "User details not found" },
        { status: 404 }
      );
    }

    const extra: Record<string, unknown> = {};
    for (const v of detail.values ?? []) {
      const key = v.field?.name;
      if (key) extra[key] = (v.value as unknown) ?? null;
    }
    const rest = { ...(detail as Record<string, unknown>) };
    delete (rest as Record<string, unknown>).values;

    return NextResponse.json(
      { data: { ...(rest as object), extra } },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/associate/user-details/item/[id] error", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
