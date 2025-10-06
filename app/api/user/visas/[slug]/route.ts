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
    console.error("GET /api/user/visas/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to fetch visa" },
      { status: 500 }
    );
  }
}
