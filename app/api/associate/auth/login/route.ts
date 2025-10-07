import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const associate = await prisma.associate.findUnique({
      where: { email },
    });

    if (!associate) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(
      password,
      associate.passwordHash
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        associateId: associate.id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        token,
        associate: {
          id: associate.id,
          email: associate.email,
          role: associate.role,
        },
      },
      { status: 200 }
    );

    response.cookies.set("associateToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
