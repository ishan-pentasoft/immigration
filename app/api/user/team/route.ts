import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const team = await prisma.team.findMany();
    return NextResponse.json({ team });
  } catch (error) {
    console.error("GET /api/user/team error", error);
    return NextResponse.json({ error: "Failed to list team" }, { status: 500 });
  }
}
