import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getRequester(req: NextRequest) {
  const requesterId = req.headers.get("x-associate-id");
  if (!requesterId) return null;
  const requester = await prisma.associate.findUnique({
    where: { id: requesterId },
  });
  return requester;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (requester.role !== "DIRECTOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;

    const body = await req.json();
    const { date, title, description, status, file } = body ?? {};

    const isValidTitle = typeof title === "string" && title.trim().length > 0;
    const isValidDescription = typeof description === "string" && description.trim().length > 0;
    const parsedDate = date ? new Date(date) : null;
    const isValidDate = parsedDate instanceof Date && !isNaN(parsedDate.getTime());

    if (!isValidTitle || !isValidDescription || !isValidDate) {
      return NextResponse.json(
        { message: "Invalid payload. Expecting title, description, date." },
        { status: 400 }
      );
    }

    const statusBool =
      typeof status === "string"
        ? status.toLowerCase() === "true"
        : typeof status === "boolean"
        ? status
        : false;

    const fileValue = typeof file === "string" && file.trim().length > 0 ? file : undefined;

    const task = await prisma.staffTasks.create({
      data: {
        date: parsedDate!,
        title: (title as string).trim(),
        description: (description as string).trim(),
        associateId: id,
        status: statusBool,
        file: fileValue,
      },
    });

    return NextResponse.json({ task, message: "Staff task created successfully" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/associate/staff-tasks/[id] error", error);
    return NextResponse.json({ error: "Failed to create staff task" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const task = await prisma.staffTasks.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isDirector = requester.role === "DIRECTOR";
    if (!isDirector && task.associateId !== requester.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("GET /api/associate/staff-tasks/[id] error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (requester.role !== "DIRECTOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;
    const existing = await prisma.staffTasks.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { date, title, description, status, file, removeFile } = body ?? {};

    const data: Parameters<typeof prisma.staffTasks.update>[0]["data"] = {};

    if (date !== undefined) {
      const d = date ? new Date(date) : null;
      if (d && !isNaN(d.getTime())) data.date = d;
    }
    if (typeof title === "string") data.title = title.trim();
    if (typeof description === "string") data.description = description.trim();

    if (status !== undefined) {
      const statusBool =
        typeof status === "string"
          ? status.toLowerCase() === "true"
          : typeof status === "boolean"
          ? status
          : existing.status;
      data.status = statusBool;
    }

    if (typeof file === "string") {
      data.file = file;
    } else if (removeFile === true) {
      data.file = null;
    }

    const updated = await prisma.staffTasks.update({ where: { id }, data });
    return NextResponse.json({ task: updated, message: "Staff task updated" });
  } catch (error) {
    console.error("PATCH /api/associate/staff-tasks/[id] error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (requester.role !== "DIRECTOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;
    await prisma.staffTasks.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Staff task deleted" });
  } catch (error) {
    console.error("DELETE /api/associate/staff-tasks/[id] error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
