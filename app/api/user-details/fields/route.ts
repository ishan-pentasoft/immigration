import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  try {
    const fields = await prisma.userDetailField.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ fields });
  } catch (error) {
    console.error("GET /api/user-details/fields error", error);
    return NextResponse.json(
      { error: "Failed to fetch fields" },
      { status: 500 }
    );
  }
}
