import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ associateId: string }> }
) {
  try {
    const { associateId } = await params;
    if (!associateId) {
      return NextResponse.json(
        { message: "associateId is required in the URL" },
        { status: 400 }
      );
    }

    const associate = await prisma.associate.findUnique({
      where: { id: associateId },
    });
    if (!associate) {
      return NextResponse.json(
        {
          message:
            "Invalid associate. Please use a valid link from your associate.",
        },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      name,
      gender,
      dob,
      pob,
      nationality,
      citizenship,
      occupation,
      appointment,
      countryPreference,
    } = body ?? {};

    const errors: string[] = [];
    if (typeof name !== "string" || !name.trim()) errors.push("name");
    if (typeof gender !== "string" || !gender.trim()) errors.push("gender");
    const parsedDob = dob ? new Date(dob) : null;
    if (!parsedDob || isNaN(parsedDob.getTime())) errors.push("dob");
    if (typeof pob !== "string" || !pob.trim()) errors.push("pob");
    if (typeof nationality !== "string" || !nationality.trim())
      errors.push("nationality");
    if (typeof citizenship !== "string" || !citizenship.trim())
      errors.push("citizenship");
    if (typeof occupation !== "string" || !occupation.trim())
      errors.push("occupation");
    const appointmentBool =
      typeof appointment === "boolean" ? appointment : false;
    if (typeof countryPreference !== "string" || !countryPreference.trim())
      errors.push("countryPreference");

    if (errors.length > 0) {
      return NextResponse.json(
        {
          message: "Missing/invalid fields.",
          invalidFields: errors,
        },
        { status: 400 }
      );
    }

    const created = await prisma.userDetails.create({
      data: {
        name: name.trim(),
        gender: gender.trim(),
        dob: parsedDob!,
        pob: pob.trim(),
        nationality: nationality.trim(),
        citizenship: citizenship.trim(),
        occupation: occupation.trim(),
        appointment: appointmentBool,
        countryPreference: countryPreference.trim(),
        associateId,
      },
    });

    return NextResponse.json(
      { data: created, message: "Details submitted successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/associate/user-details/[associateId] error",
      error
    );
    return NextResponse.json(
      { error: "Failed to submit details" },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ associateId: string }> }
) {
  try {
    const { associateId } = await params;
    if (!associateId) {
      return NextResponse.json(
        { message: "associateId is required in the URL" },
        { status: 400 }
      );
    }

    const associate = await prisma.associate.findUnique({
      where: { id: associateId },
    });
    if (!associate) {
      return NextResponse.json(
        { message: "Invalid associate." },
        { status: 404 }
      );
    }

    const url = new URL(_req.url);
    const pageParam = parseInt(url.searchParams.get("page") || "1", 10);
    const limitParam = parseInt(url.searchParams.get("limit") || "10", 10);
    const search = (url.searchParams.get("search") || "").trim();
    const filterAssociateId = url.searchParams.get("associateId") || undefined;

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10;

    const isDirector = associate.role.toUpperCase() === "DIRECTOR";

    const where: Prisma.UserDetailsWhereInput = {};
    if (isDirector) {
      if (filterAssociateId) {
        where.associateId = filterAssociateId;
      }
    } else {
      where.associateId = associateId;
    }

    if (search) {
      const q = search;
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { nationality: { contains: q, mode: "insensitive" } },
        { citizenship: { contains: q, mode: "insensitive" } },
        { occupation: { contains: q, mode: "insensitive" } },
      ];
    }

    const total = await prisma.userDetails.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * limit;

    const details = await prisma.userDetails.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json(
      {
        data: details,
        page: currentPage,
        limit,
        total,
        totalPages,
        message: "User details fetched successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/associate/user-details/[associateId] error", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
