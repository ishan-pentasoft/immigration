import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

function normalizeIp(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const first = raw.split(",")[0].trim();
  if (first === "::1") return "127.0.0.1";
  const mapped = first.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return mapped[1];
  return first;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const xfwd = request.headers.get("x-forwarded-for");
    const xreal = request.headers.get("x-real-ip");
    const cfip = request.headers.get("cf-connecting-ip");
    const rawIp = (xfwd?.split(",")[0].trim() || xreal || cfip || undefined) as
      | string
      | undefined;
    const ip = normalizeIp(rawIp);
    const userAgent = request.headers.get("user-agent") || undefined;

    if (!username || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const associate = await prisma.associate.findUnique({
      where: { username },
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
      await prisma.associateLoginLog.create({
        data: {
          associateId: associate.id,
          username: associate.username,
          ip,
          userAgent,
          success: false,
          message: "Invalid password",
        },
      });
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        associateId: associate.id,
        role: associate.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );

    await prisma.associateLoginLog.create({
      data: {
        associateId: associate.id,
        username: associate.username,
        ip,
        userAgent,
        success: true,
        message: "Login successful",
      },
    });

    const response = NextResponse.json(
      {
        message: "Login successful",
        token,
        associate: {
          id: associate.id,
          username: associate.username,
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
