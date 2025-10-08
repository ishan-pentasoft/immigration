import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  const associateUsername = process.env.DIRECTOR_USERNAME;
  const associateEmail = process.env.DIRECTOR_EMAIL;
  const associatePassword = process.env.DIRECTOR_PASSWORD;
  const associateRole = process.env.DIRECTOR_ROLE;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be provided");
  }

  if (!associateEmail || !associatePassword || !associateRole) {
    throw new Error(
      "DIRECTOR_EMAIL, DIRECTOR_PASSWORD, and DIRECTOR_ROLE must be provided"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const associatePasswordHash = await bcrypt.hash(associatePassword, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  await prisma.associate.upsert({
    where: { email: associateEmail },
    update: {
      passwordHash: associatePasswordHash,
      role: associateRole,
      username: associateUsername,
    },
    create: {
      username: associateUsername,
      email: associateEmail,
      passwordHash: associatePasswordHash,
      role: associateRole,
    },
  });

  console.log("✅ Admin user seeded:", email);
  console.log("✅ Associate user seeded:", associateEmail);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
