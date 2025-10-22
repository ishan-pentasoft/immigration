import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("associateToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      associateId: string;
    };

    const associate = await prisma.associate.findUnique({
      where: { id: decoded.associateId },
      select: {
        id: true,
        email: true,
        role: true,
        emailService: {
          select: {
            email: true,
            password: true,
          },
        },
      },
    });

    if (!associate) {
      return NextResponse.json(
        { message: "Invalid user or insufficient permissions" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      associate: {
        id: associate.id,
        email: associate.email,
        role: associate.role,
        emailService: associate.emailService,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
