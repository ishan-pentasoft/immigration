import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getStudent(req: NextRequest) {
  const studentId = req.headers.get("x-student-id");
  if (!studentId) return null;
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { associate: true },
  });
  return student;
}

export async function POST(req: NextRequest) {
  try {
    const student = await getStudent(req);
    if (!student) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, priority = "MEDIUM", attachmentUrl } = body;

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        attachmentUrl,
        studentId: student.id,
        associateId: student.associateId,
      },
      include: {
        student: true,
        associate: true,
        messages: {
          include: {
            student: true,
            associate: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const student = await getStudent(req);
    if (!student) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawSearch = searchParams.get("search") || "";
    const search = rawSearch.trim();
    const status = searchParams.get("status") as "OPEN" | "CLOSED" | null;
    const pageParam = Number(searchParams.get("page")) || 1;
    const limitParam = Number(searchParams.get("limit")) || 10;
    const page = Math.max(1, pageParam);
    const limit = Math.min(Math.max(1, limitParam), 100);

    const where: Prisma.TicketWhereInput = {
      studentId: student.id,
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
      ...(status && { status }),
    };

    const [total, tickets] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        include: {
          student: true,
          associate: true,
          messages: {
            include: {
              student: true,
              associate: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const ticketsWithLatestMessage = tickets.map((ticket) => ({
      ...ticket,
      latestMessage: ticket.messages[0] || null,
      messages: undefined,
    }));

    return NextResponse.json({
      tickets: ticketsWithLatestMessage,
      total,
      totalPages,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
