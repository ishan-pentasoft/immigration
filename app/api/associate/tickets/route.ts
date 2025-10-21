import { Prisma } from "@/generated/prisma";
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

export async function GET(req: NextRequest) {
  try {
    const requester = await getRequester(req);
    if (!requester) {
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

    const searchWhere: Prisma.TicketWhereInput | undefined = search
      ? {
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
            {
              student: {
                name: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          ],
        }
      : undefined;

    const isDirector = requester.role === "DIRECTOR";
    const where: Prisma.TicketWhereInput = {
      ...(isDirector ? {} : { associateId: requester.id }),
      ...(status && { status }),
      ...(searchWhere && searchWhere),
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
