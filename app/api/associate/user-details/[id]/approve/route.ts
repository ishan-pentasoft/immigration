import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

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
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // id is userDetailsId
    if (!id) {
      return NextResponse.json(
        { message: "userDetails id is required" },
        { status: 400 }
      );
    }

    await req.json().catch(() => ({}));

    const userDetails = await prisma.userDetails.findUnique({
      where: { id },
      include: {
        values: { include: { field: true } },
      },
    });
    if (!userDetails) {
      return NextResponse.json(
        { message: "UserDetails not found" },
        { status: 404 }
      );
    }

    const isDirector = requester.role === "DIRECTOR";
    if (!isDirector && requester.id !== userDetails.associateId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (userDetails.approved) {
      return NextResponse.json(
        {
          message: "UserDetails already approved",
          approvedAt: userDetails.approvedAt,
        },
        { status: 409 }
      );
    }

    const existingByEmail = await prisma.student
      .findUnique({ where: { email: userDetails.email } })
      .catch(() => null);
    if (existingByEmail) {
      return NextResponse.json(
        {
          message: "Student with this email already exists",
          conflict: "email",
        },
        { status: 409 }
      );
    }
    const existingByPhone = await prisma.student
      .findUnique({ where: { phone: userDetails.phone } })
      .catch(() => null);
    if (existingByPhone) {
      return NextResponse.json(
        {
          message: "Student with this phone already exists",
          conflict: "phone",
        },
        { status: 409 }
      );
    }

    const finalPassword = `${userDetails.name
      .trim()
      .toLowerCase()
      .split(" ")
      .join("")
      .slice(0, 4)}@123`;
    const passwordHash = await bcrypt.hash(finalPassword, 10);

    const created = await prisma.$transaction(async (tx) => {
      const entries: [string, Prisma.InputJsonValue][] = [];
      for (const v of userDetails.values ?? []) {
        if (v.field?.name) {
          entries.push([
            v.field.name,
            v.value as unknown as Prisma.InputJsonValue,
          ]);
        }
      }
      const extra = Object.fromEntries(entries) as Prisma.InputJsonObject;
      const student = await tx.student.create({
        data: {
          name: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone,
          gender: userDetails.gender,
          dob: userDetails.dob,
          passwordHash,
          associateId: userDetails.associateId,
          nationality: userDetails.nationality,
          citizenship: userDetails.citizenship,
          countryPreference: userDetails.countryPreference,
          extra,
          approved: true,
          approvedAt: new Date(),
          approvedById: requester.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          gender: true,
          dob: true,
          associateId: true,
          nationality: true,
          citizenship: true,
          countryPreference: true,
          extra: true,
          approved: true,
          approvedAt: true,
          approvedById: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      await tx.userDetailValue.deleteMany({
        where: { userDetailsId: userDetails.id },
      });
      await tx.userDetails.delete({ where: { id: userDetails.id } });
      return student;
    });

    return NextResponse.json(
      {
        message: "Student account created successfully",
        student: created,
        generatedPassword: finalPassword,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/associate/user-details/[id]/approve error", err);
    return NextResponse.json(
      { error: "Failed to approve student" },
      { status: 500 }
    );
  }
}
