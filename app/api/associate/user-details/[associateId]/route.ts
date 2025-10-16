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
      extra,
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

    const activeFields = await prisma.userDetailField.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    const extraObj: Record<string, unknown> =
      extra && typeof extra === "object" && !Array.isArray(extra) ? extra : {};
    for (const f of activeFields) {
      if (f.required) {
        const v = (extraObj as Record<string, unknown>)[f.name];
        const missing =
          v === undefined ||
          v === null ||
          (typeof v === "string" && v.trim().length === 0) ||
          (Array.isArray(v) && v.length === 0);
        if (missing) errors.push(`extra.${f.name}`);
      }
    }

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

    if (activeFields.length > 0 && Object.keys(extraObj).length > 0) {
      const valuesToCreate: {
        userDetailsId: string;
        fieldId: string;
        value: Prisma.InputJsonValue;
      }[] = [];
      for (const f of activeFields) {
        if (Object.prototype.hasOwnProperty.call(extraObj, f.name)) {
          const v = (extraObj as Record<string, unknown>)[f.name] as unknown;
          valuesToCreate.push({
            userDetailsId: created.id,
            fieldId: f.id,
            value: v as Prisma.InputJsonValue,
          });
        }
      }
      if (valuesToCreate.length > 0) {
        await prisma.userDetailValue.createMany({ data: valuesToCreate });
      }
    }

    const extraMap: Record<string, unknown> = {};
    for (const f of activeFields) {
      if (Object.prototype.hasOwnProperty.call(extraObj, f.name)) {
        extraMap[f.name] = (extraObj as Record<string, unknown>)[f.name];
      }
    }

    return NextResponse.json(
      {
        data: { ...created, extra: extraMap },
        message: "Details submitted successfully.",
      },
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
      include: {
        values: {
          include: { field: true },
        },
      },
    });

    const data = details.map((d) => {
      const extra: Record<string, unknown> = {};
      for (const v of d.values) {
        const key = v.field?.name;
        if (key) extra[key] = (v.value as unknown) ?? null;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { values, ...rest } = d as typeof d & { values: typeof d.values };
      return { ...rest, extra };
    });

    return NextResponse.json(
      {
        data,
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ associateId: string }> }
) {
  try {
    const { associateId } = await params;
    await prisma.userDetails.delete({ where: { id: associateId } });
    return NextResponse.json(
      { message: "User details deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "DELETE /api/associate/user-details/[associateId] error",
      error
    );
    return NextResponse.json(
      { error: "Failed to delete user details" },
      { status: 500 }
    );
  }
}
