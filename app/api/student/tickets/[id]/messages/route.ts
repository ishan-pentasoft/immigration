import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getStudent(req: NextRequest) {
  const studentId = req.headers.get("x-student-id");
  if (!studentId) return null;
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });
  return student;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const student = await getStudent(req);
    if (!student) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, attachmentUrl } = body;
    const { id } = await params;

    if (!content) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        studentId: student.id,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    if (ticket.status === "CLOSED") {
      return NextResponse.json(
        { message: "Cannot add message to closed ticket" },
        { status: 400 }
      );
    }

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        content,
        attachmentUrl,
        senderType: "STUDENT",
        studentId: student.id,
      },
      include: {
        student: true,
        associate: true,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error creating ticket message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
