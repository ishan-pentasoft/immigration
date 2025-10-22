import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const associateId = req.headers.get("x-associate-id");
    if (!associateId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const emailService = await prisma.emailService.findFirst({
      where: { associateId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { emailService: emailService || null },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/associate/email-service error", error);
    return NextResponse.json(
      { error: "Failed to fetch email service" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const associateId = req.headers.get("x-associate-id");
    if (!associateId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, password } = body as { email?: unknown; password?: unknown };

    const isValidEmail = typeof email === "string" && email.includes("@");
    const isPasswordProvided =
      typeof password === "string" && password.length > 0;

    if (!isValidEmail) {
      return NextResponse.json(
        { message: "Invalid payload. Expecting a valid email." },
        { status: 400 }
      );
    }

    const existing = await prisma.emailService.findFirst({
      where: { associateId },
    });

    let saved;
    if (!existing) {
      if (!isPasswordProvided) {
        return NextResponse.json(
          { message: "Password is required for first-time setup." },
          { status: 400 }
        );
      }
      saved = await prisma.emailService.create({
        data: {
          email: email as string,
          password: password as string,
          associateId,
        },
      });
    } else {
      saved = await prisma.emailService.update({
        where: { id: existing.id },
        data: {
          email: email as string,
          ...(isPasswordProvided ? { password: password as string } : {}),
        },
      });
    }

    return NextResponse.json(
      {
        emailService: saved,
        message: existing ? "Email service updated" : "Email service created",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/associate/email-service error", error);
    return NextResponse.json(
      { error: "Failed to save email service" },
      { status: 500 }
    );
  }
}
