import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
  try {
    const whyChooseUs = await prisma.whyChooseUs.findMany();
    return NextResponse.json({ whyChooseUs }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/why-choose-us error", error);
    return NextResponse.json(
      { error: "Failed to list why choose us" },
      { status: 500 }
    );
  }
}
