import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const country = await prisma.country.findUnique({
      where: { slug: (await ctx.params).slug },
      include: { colleges: true },
    });
    if (!country)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ country });
  } catch (err) {
    console.error("GET /api/user/countries/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to fetch country" },
      { status: 500 }
    );
  }
}
