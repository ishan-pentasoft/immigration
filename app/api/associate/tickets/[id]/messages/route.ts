import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getRequester(req: NextRequest) {
  const requesterId = req.headers.get("x-associate-id");
  if (!requesterId) return null;
  const requester = await prisma.associate.findUnique({
    where: { id: requesterId },
  });
  return requester;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const requester = await getRequester(req);
    const { id } = await params;
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, attachmentUrl } = body;

    if (!content) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      );
    }

    const isDirector = requester.role === "DIRECTOR";
    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        ...(isDirector ? {} : { associateId: requester.id }),
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

    const senderType = requester.role === "DIRECTOR" ? "DIRECTOR" : "ASSOCIATE";

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        content,
        attachmentUrl,
        senderType,
        associateId: requester.id,
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
