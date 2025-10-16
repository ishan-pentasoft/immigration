import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function getRequester(req: NextRequest) {
  const requesterId = req.headers.get("x-associate-id");
  if (!requesterId) return null;
  const requester = await prisma.associate.findUnique({
    where: { id: requesterId },
  });
  return requester;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isDirector = requester.role === "DIRECTOR";
    if (!isDirector && existing.associateId !== requester.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      gender,
      dob,
      nationality,
      citizenship,
      countryPreference,
      extra,
      password,
    } = body || {};

    const data: Record<string, unknown> = {};
    if (typeof name === "string") data.name = name;
    if (typeof email === "string") data.email = email;
    if (typeof phone === "string") data.phone = phone;
    if (typeof gender === "string") data.gender = gender;
    if (typeof dob === "string") data.dob = new Date(dob);
    if (typeof nationality === "string") data.nationality = nationality;
    if (typeof citizenship === "string") data.citizenship = citizenship;
    if (typeof countryPreference === "string")
      data.countryPreference = countryPreference;
    if (extra !== undefined) data.extra = extra;
    if (typeof password === "string" && password.trim().length > 0) {
      data.passwordHash = bcrypt.hashSync(password, 10);
    }

    try {
      const student = await prisma.student.update({ where: { id }, data });
      return NextResponse.json({ student, message: "Student updated" });
    } catch {
      return NextResponse.json({ error: "Failed to update" }, { status: 400 });
    }
  } catch (error) {
    console.error("PATCH /api/associate/students/[id] error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        associate: true,
        approvedBy: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isDirector = requester.role === "DIRECTOR";
    if (!isDirector && student.associateId !== requester.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("GET /api/associate/students/[id] error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    // Ensure the record exists for 404 semantics
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isDirector = requester.role === "DIRECTOR";
    if (!isDirector && existing.associateId !== requester.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.student.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Student deleted" });
  } catch (error) {
    console.error("DELETE /api/associate/students/[id] error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
