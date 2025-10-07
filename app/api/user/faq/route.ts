import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
  try {
    const faq = await prisma.faq.findMany();
    return NextResponse.json({ faq }, { status: 200 });
  } catch (error) {
    console.error("GET /api/user/faq error", error);
    return NextResponse.json({ error: "Failed to list faq" }, { status: 500 });
  }
}
