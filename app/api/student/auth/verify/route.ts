import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("studentToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      studentId: string;
    };

    const student = await prisma.student.findUnique({
      where: { id: decoded.studentId },
      include: {
        associate: true,
        approvedBy: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Invalid student or insufficient permissions" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      student,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
