import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const staff = await prisma.associate.findFirst({
      where: { id },
    });

    if (!staff) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json(
      { staff, message: "Staff fetched succesfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { message: "Error fetching staff" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.associate.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Staff deleted succesfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      { message: "Error deleting staff" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { username, email, role, password } = await req.json();

  const data: Record<string, unknown> = { username, email, role };
  if (typeof password === "string" && password.trim().length > 0) {
    data.passwordHash = bcrypt.hashSync(password, 10);
  }

  try {
    const staff = await prisma.associate.update({
      where: { id },
      data,
    });

    return NextResponse.json(
      { staff, message: "Staff updated succesfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { message: "Error updating staff" },
      { status: 500 }
    );
  }
}
