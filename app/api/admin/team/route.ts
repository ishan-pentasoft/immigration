import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const team = await prisma.team.findMany();
    return NextResponse.json({ team });
  } catch (error) {
    console.error("GET /api/admin/team error", error);
    return NextResponse.json({ error: "Failed to list team" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, title, imageUrl } = body ?? {};

    if (!name || !title || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingName = await prisma.team.findUnique({ where: { name } });
    if (existingName) {
      return NextResponse.json(
        { error: "Name already exists" },
        { status: 409 }
      );
    }

    const team = await prisma.team.create({ data: { name, title, imageUrl } });
    if (!team) {
      return NextResponse.json(
        { error: "Failed to create team" },
        { status: 500 }
      );
    }

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/team error", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
