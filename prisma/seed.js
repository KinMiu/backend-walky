import "dotenv/config";
import bcrypt from "bcrypt";
import logger from "../src/utils/logger.js";
import {prisma} from "../src/config/prisma.js";

async function main() {
  logger.info("🌱 Starting database seeding...");

  const saltRounds = 10;

  // 1. Seed Super Admin
  const superAdminEmail = process.env.SEED_SUPERADMIN_EMAIL || "superadmin@example.com";
  const superAdminPassword = process.env.SEED_SUPERADMIN_PASSWORD || "superadmin123";

  const existingSuperAdmin = await prisma.user.findUnique({
    where: {email: superAdminEmail},
  });

  let superAdmin;
  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, saltRounds);
    superAdmin = await prisma.user.create({
      data: {
        username: "superadmin",
        email: superAdminEmail,
        passwordHash: hashedPassword,
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
    logger.info(`✅ SUPER_ADMIN created: ${superAdminEmail}`);
  } else {
    superAdmin = existingSuperAdmin;
    logger.info(`ℹ️ SUPER_ADMIN already exists: ${superAdminEmail}`);
  }

  // 2. Seed Admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";

  const existingAdmin = await prisma.user.findUnique({
    where: {email: adminEmail},
  });

  let admin;
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    admin = await prisma.user.create({
      data: {
        username: "admin_user",
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });
    logger.info(`✅ ADMIN created: ${adminEmail}`);
  } else {
    admin = existingAdmin;
    logger.info(`ℹ️ ADMIN already exists: ${adminEmail}`);
  }

  // 3. Seed Member
  const memberEmail = process.env.SEED_MEMBER_EMAIL || "member@example.com";
  const memberPassword = process.env.SEED_MEMBER_PASSWORD || "member123";

  const existingMember = await prisma.user.findUnique({
    where: {email: memberEmail},
  });

  let member;
  if (!existingMember) {
    const hashedPassword = await bcrypt.hash(memberPassword, saltRounds);
    member = await prisma.user.create({
      data: {
        username: "member_john",
        email: memberEmail,
        passwordHash: hashedPassword,
        role: "MEMBER",
        isActive: true,
      },
    });
    logger.info(`✅ MEMBER created: ${memberEmail}`);
  } else {
    member = existingMember;
    logger.info(`ℹ️ MEMBER already exists: ${memberEmail}`);
  }

  // 4. Seed Sample Active Room
  const existingActiveRoom = await prisma.activeRoom.findFirst({
    where: {hostId: member.id},
  });

  if (!existingActiveRoom) {
    await prisma.activeRoom.create({
      data: {
        pinCode: "8821",
        hostId: member.id,
      },
    });
    logger.info("✅ Sample Active Room (PIN: 8821) created for Member");
  }

  logger.info("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    logger.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
