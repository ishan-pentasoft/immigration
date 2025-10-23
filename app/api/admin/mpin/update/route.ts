import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const oldMpin = String(body?.oldMpin ?? "").trim();
    const newMpin = String(body?.newMpin ?? "").trim();

    if (!newMpin) {
      return NextResponse.json(
        { message: "New MPIN is required" },
        { status: 400 }
      );
    }

    if (!/^\d{4,8}$/.test(newMpin)) {
      return NextResponse.json(
        { message: "MPIN must be 4-8 digits" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findFirst({ select: { id: true, mpinHash: true } });
    if (!admin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    if (admin.mpinHash) {
      if (!oldMpin) {
        return NextResponse.json(
          { message: "Old MPIN is required" },
          { status: 400 }
        );
      }
      const ok = await bcrypt.compare(oldMpin, admin.mpinHash);
      if (!ok) {
        return NextResponse.json(
          { message: "Old MPIN is incorrect" },
          { status: 401 }
        );
      }
    }

    const mpinHash = await bcrypt.hash(newMpin, 12);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { mpinHash },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/admin/mpin/update error", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
