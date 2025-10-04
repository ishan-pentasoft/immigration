import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const faq = await prisma.faq.findUnique({
      where: { id: (await ctx.params).id },
    });
    if (!faq) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ faq });
  } catch (error) {
    console.error("GET /api/admin/faq/[id] error", error);
    return NextResponse.json({ error: "Failed to fetch faq" }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const body = await req.json();
    const { question, answer } = body;

    const faq = await prisma.faq.update({
      where: { id: (await ctx.params).id },
      data: { question, answer },
    });
    return NextResponse.json({ faq });
  } catch (error) {
    console.error("PUT /api/admin/faq/[id] error", error);
    return NextResponse.json(
      { error: "Failed to update faq" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const existing = await prisma.faq.findUnique({
      where: { id: (await ctx.params).id },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.faq.delete({ where: { id: (await ctx.params).id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/faq/[id] error", err);
    return NextResponse.json(
      { error: "Failed to delete faq" },
      { status: 500 }
    );
  }
}
