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

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        associate: true,
        approvedBy: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isDirector = requester.role === "DIRECTOR";
    if (!isDirector && student.associateId !== requester.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("GET /api/associate/students/[id] error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    // Ensure the record exists for 404 semantics
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isDirector = requester.role === "DIRECTOR";
    if (!isDirector && existing.associateId !== requester.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.student.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Student deleted" });
  } catch (error) {
    console.error("DELETE /api/associate/students/[id] error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
