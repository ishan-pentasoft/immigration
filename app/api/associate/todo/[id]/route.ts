import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const current = await prisma.todo.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!current) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const updated = await prisma.todo.update({
      where: { id },
      data: { status: !current.status },
    });

    return NextResponse.json(
      { todo: updated, message: "Todo toggled successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/associate/todo/[id] error", error);
    return NextResponse.json(
      { error: "Failed to toggle todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.todo.delete({ where: { id } });

    return NextResponse.json(
      { message: "Todo deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/associate/todo/[id] error", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
