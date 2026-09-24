import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = "admin";
  const adminPassword = "admin123";

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        username: adminUsername,
        passwordHash,
        role: "ADMIN",
        displayName: "Shop Admin",
      },
    });
    console.log(
      `Seeded admin user -> username: "${adminUsername}", password: "${adminPassword}" (change this before real use)`
    );
  } else {
    console.log("Admin user already exists, skipping.");
  }

  const existingSettings = await prisma.shopSettings.findFirst();
  if (!existingSettings) {
    await prisma.shopSettings.create({
      data: {
        businessName: "Unknown Auto Spa",
        addressLine1: "123 Main St",
        city: "Anytown",
        state: "NA",
        zip: "00000",
        phone: "555-555-5555",
      },
    });
    console.log('Seeded default ShopSettings -> businessName: "Unknown Auto Spa"');
  } else {
    console.log("ShopSettings already exists, skipping.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
