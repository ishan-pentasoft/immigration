import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const visa = await prisma.visa.findUnique({
      where: { slug: (await ctx.params).slug },
    });
    if (!visa)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ visa });
  } catch (err) {
    console.error("GET /api/admin/visas/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to fetch visa" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const body = await req.json();
    const { title, description, slug, imageUrl } = body ?? {};

    const existing = await prisma.visa.findUnique({
      where: { slug: (await ctx.params).slug },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.visa.findUnique({ where: { slug } });
      if (slugTaken)
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 }
        );
    }

    const visa = await prisma.visa.update({
      where: { slug: (await ctx.params).slug },
      data: { title, description, slug, imageUrl },
    });

    return NextResponse.json({ visa });
  } catch (err) {
    console.error("PUT /api/admin/visas/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to update visa" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const existing = await prisma.visa.findUnique({
      where: { slug: (await ctx.params).slug },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.visa.delete({ where: { slug: (await ctx.params).slug } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/visas/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to delete visa" },
      { status: 500 }
    );
  }
}
