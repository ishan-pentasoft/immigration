import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getRequester(req: NextRequest) {
  const requesterId = req.headers.get("x-associate-id");
  if (!requesterId) return null;
  const requester = await prisma.associate.findUnique({ where: { id: requesterId } });
  return requester;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const requester = await getRequester(req);
    if (!requester) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (requester.role !== "DIRECTOR") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const exists = await prisma.userDetailField.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const body = await req.json();
    const { label, name, type, required, options, active, order } = body ?? {};

    const data: Parameters<typeof prisma.userDetailField.update>[0]["data"] = {};
    if (typeof label === "string") data.label = label.trim();
    if (typeof name === "string") data.name = name.trim();
    if (typeof required === "boolean") data.required = required;
    if (typeof active === "boolean") data.active = active;
    if (options !== undefined) data.options = options;
    if (Number.isFinite(order)) data.order = Number(order);

    if (typeof type === "string") {
      const typeUpper = type.toUpperCase();
      const allowed = new Set(["TEXT","TEXTAREA","NUMBER","DATE","SELECT","RADIO","CHECKBOX"]);
      if (!allowed.has(typeUpper)) return NextResponse.json({ message: "Invalid type" }, { status: 400 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any).type = typeUpper as any;
    }

    const updated = await prisma.userDetailField.update({ where: { id }, data });
    return NextResponse.json({ field: updated, message: "Field updated" });
  } catch (error) {
    console.error("PUT /api/associate/user-details/fields/[id] error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const requester = await getRequester(req);
    if (!requester) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (requester.role !== "DIRECTOR") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;

    // optional: cascade delete values (relation onDelete: Cascade handles it)
    await prisma.userDetailField.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Field deleted" });
  } catch (error) {
    console.error("DELETE /api/associate/user-details/fields/[id] error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
