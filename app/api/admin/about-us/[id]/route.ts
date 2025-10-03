import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { description, imageUrl } = body ?? {};

    const aboutUs = await prisma.aboutUs.update({
      where: { id: (await params).id },
      data: { description, imageUrl },
    });

    return NextResponse.json({ aboutUs });
  } catch (err) {
    console.error("PUT /api/admin/about-us/[id] error", err);
    return NextResponse.json(
      { error: "Failed to update about us" },
      { status: 500 }
    );
  }
}
