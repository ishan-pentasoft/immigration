import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.userDetails.delete({ where: { id } });
    return NextResponse.json(
      { message: "User details deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/associate/user-details/[id] error", error);
    return NextResponse.json(
      { error: "Failed to delete user details" },
      { status: 500 }
    );
  }
}
