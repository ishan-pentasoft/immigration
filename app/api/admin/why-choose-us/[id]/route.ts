import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const whyChooseUs = await prisma.whyChooseUs.findUnique({
      where: { id: (await ctx.params).id },
    });
    if (!whyChooseUs)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ whyChooseUs });
  } catch (err) {
    console.error("GET /api/admin/why-choose-us/[id] error", err);
    return NextResponse.json(
      { error: "Failed to fetch why choose us" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const body = await req.json();
    const { title, description, link } = body ?? {};

    const whyChooseUs = await prisma.whyChooseUs.update({
      where: { id: (await ctx.params).id },
      data: { title, description, link },
    });

    return NextResponse.json({ whyChooseUs });
  } catch (err) {
    console.error("PUT /api/admin/why-choose-us/[id] error", err);
    return NextResponse.json(
      { error: "Failed to update why choose us" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const existing = await prisma.whyChooseUs.findUnique({
      where: { id: (await ctx.params).id },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.whyChooseUs.delete({ where: { id: (await ctx.params).id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/why-choose-us/[id] error", err);
    return NextResponse.json(
      { error: "Failed to delete why choose us" },
      { status: 500 }
    );
  }
}
