import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    if (associate.role.toUpperCase() === "DIRECTOR") {
      const details = await prisma.userDetails.findMany();
      return NextResponse.json(
        { data: details, message: "User details fetched successfully." },
        { status: 200 }
      );
    }

    const details = await prisma.userDetails.findMany({
      where: { associateId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { data: details, message: "User details fetched successfully." },
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
