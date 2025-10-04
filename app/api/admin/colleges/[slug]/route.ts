import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const college = await prisma.college.findUnique({
      where: { slug: (await ctx.params).slug },
      include: { country: true },
    });
    if (!college)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ college });
  } catch (err) {
    console.error("GET /api/admin/colleges/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to fetch college" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const body = await req.json();
    const { name, description, slug, imageUrl, countryId } = body ?? {};

    const existing = await prisma.college.findUnique({
      where: { slug: (await ctx.params).slug },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.college.findUnique({ where: { slug } });
      if (slugTaken)
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 }
        );
    }

    if (countryId) {
      const country = await prisma.country.findUnique({ where: { id: countryId } });
      if (!country)
        return NextResponse.json(
          { error: "Invalid countryId" },
          { status: 400 }
        );
    }

    const college = await prisma.college.update({
      where: { slug: (await ctx.params).slug },
      data: { name, description, slug, imageUrl, countryId },
    });

    return NextResponse.json({ college });
  } catch (err) {
    console.error("PUT /api/admin/colleges/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to update college" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const existing = await prisma.college.findUnique({
      where: { slug: (await ctx.params).slug },
    });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.college.delete({ where: { slug: (await ctx.params).slug } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/colleges/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to delete college" },
      { status: 500 }
    );
  }
}
