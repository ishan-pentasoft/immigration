import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, answer } = body ?? {};

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const faq = await prisma.faq.create({ data: { question, answer } });
    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/faq error", error);
    return NextResponse.json(
      { error: "Failed to create faq" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
  try {
    const faq = await prisma.faq.findMany();
    return NextResponse.json({ faq }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/faq error", error);
    return NextResponse.json({ error: "Failed to list faq" }, { status: 500 });
  }
}
