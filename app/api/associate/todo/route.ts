import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { date, title } = body as {
      date?: string | Date;
      title?: unknown;
      status?: unknown;
    };

    const isValidTitle = typeof title === "string" && title.trim().length > 0;
    const parsedDate = date ? new Date(date) : null;
    const isValidDate =
      parsedDate instanceof Date && !isNaN(parsedDate.getTime());

    if (!isValidTitle || !isValidDate) {
      return NextResponse.json(
        {
          message:
            "Invalid payload. Expecting title (non-empty string), and date (valid date).",
        },
        { status: 400 }
      );
    }

    const associateId = req.headers.get("x-associate-id");
    if (!associateId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const todo = await prisma.todo.create({
      data: {
        date: parsedDate!,
        title: (title as string).trim(),
        associateId,
      },
    });

    return NextResponse.json(
      { todo, message: "Todo Created Successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/associate/todo error", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const associateId = req.headers.get("x-associate-id");
    if (!associateId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const todos = await prisma.todo.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        associateId,
      },
    });
    return NextResponse.json(
      { todos, message: "Todos fetched successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/associate/todo error", error);
    return NextResponse.json(
      {
        error: "Failed to fetch todos",
      },
      { status: 500 }
    );
  }
}
