import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mpin = String(body?.mpin ?? "").trim();

    if (!mpin) {
      return NextResponse.json(
        { message: "MPIN is required" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findFirst({ select: { mpinHash: true } });
    const hash = admin?.mpinHash || null;
    if (!hash) {
      return NextResponse.json(
        { message: "MPIN not set" },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(mpin, hash);
    if (!ok) {
      return NextResponse.json(
        { message: "Invalid MPIN" },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/admin/mpin/verify error", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
