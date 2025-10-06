import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      countries,
    });
  } catch (err) {
    console.error("GET /api/user/countries error", err);
    return NextResponse.json(
      { error: "Failed to list countries" },
      { status: 500 }
    );
  }
}
