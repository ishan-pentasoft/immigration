import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, role, password } = body;

    const existingStaff = await prisma.associate.findUnique({
      where: {
        email,
      },
    });

    if (existingStaff) {
      return NextResponse.json(
        { error: "Staff with this email already exists" },
        { status: 400 }
      );
    }
    const existingStaffUsername = await prisma.associate.findUnique({
      where: {
        username,
      },
    });

    if (existingStaffUsername) {
      return NextResponse.json(
        { error: "Staff with this username already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const staff = await prisma.associate.create({
      data: {
        username,
        email,
        role,
        passwordHash,
      },
    });

    return NextResponse.json(
      { staff, message: "Staff created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create staff" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const staff = await prisma.associate.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });
    return NextResponse.json(
      { staff, message: "Staff fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}
