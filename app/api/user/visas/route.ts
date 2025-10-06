import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
  try {
    const visas = await prisma.visa.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      visas,
    });
  } catch (err) {
    console.error("GET /api/user/visas error", err);
    return NextResponse.json(
      { error: "Failed to list visas" },
      { status: 500 }
    );
  }
}
