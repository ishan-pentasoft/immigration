import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notice = await prisma.notice.upsert({
      where: { id: "notice" },
      update: {},
      create: { id: "notice", title: "", description: "" },
    });
    return NextResponse.json({ notice });
  } catch (err) {
    console.error("GET /api/associate/notice error", err);
    return NextResponse.json(
      { error: "Failed to load notice" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description } = body ?? {};

    const associateId = req.headers.get("x-associate-id") ?? undefined;
    if (!associateId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const assoc = await prisma.associate.findUnique({
      where: { id: associateId },
    });
    if (!assoc || assoc.role !== "DIRECTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.notice.update({
      where: { id: "notice" },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });

    return NextResponse.json({ notice: updated });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err?.code === "P2025") {
      try {
        const body = await req.json();
        const { title, description } = body ?? {};
        const associateId = req.headers.get("x-associate-id") ?? undefined;
        if (!associateId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const assoc = await prisma.associate.findUnique({
          where: { id: associateId },
        });
        if (!assoc || assoc.role !== "DIRECTOR") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const created = await prisma.notice.create({
          data: {
            id: "notice",
            title: title ?? "",
            description: description ?? "",
          },
        });
        return NextResponse.json({ notice: created });
      } catch (e) {
        console.error("PUT(create) /api/associate/notice error", e);
        return NextResponse.json(
          { error: "Failed to create notice" },
          { status: 500 }
        );
      }
    }

    console.error("PUT /api/associate/notice error", err);
    return NextResponse.json(
      { error: "Failed to update notice" },
      { status: 500 }
    );
  }
}
