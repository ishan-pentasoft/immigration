import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const college = await prisma.college.findUnique({
      where: { slug },
      include: { country: true },
    });

    if (!college) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ college });
  } catch (err) {
    console.error("GET /api/user/colleges/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to get college" },
      { status: 500 }
    );
  }
}
