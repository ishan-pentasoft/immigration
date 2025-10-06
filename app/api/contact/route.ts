import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, visaType, message } = body ?? {};

    if (!name || !phone || !email || !visaType || !message) {
      return NextResponse.json(
        {
          error:
            "All fields (name, phone, email, visaType, message) are required",
        },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: { name, phone, email, visaType, message },
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contact error", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
