import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌊 Seeding AquaFotos 2.0…");

  await prisma.pricingConfig.create({
    data: {
      firstImagePrice: 3500,
      secondImagePrice: 2500,
      additionalPrice: 1500,
      active: true,
    },
  });

  const adminPassword = await bcrypt.hash("admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@aquafotos.com" },
    update: {},
    create: {
      email: "admin@aquafotos.com",
      name: "Kasimir Eckhardt",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const photographer = await prisma.user.upsert({
    where: { email: "annika@aquafotos.com" },
    update: {},
    create: {
      email: "annika@aquafotos.com",
      name: "Annika Eckhardt",
      passwordHash: adminPassword,
      role: UserRole.PHOTOGRAPHER,
    },
  });

  const partner = await prisma.partner.create({
    data: {
      name: "Vitasol Bad Salzuflen",
      type: "SWIMMING_POOL",
      city: "Bad Salzuflen",
      address: "Vitasol Therme",
      contactEmail: "info@vitasol.de",
      description:
        "Partner für emotionale Unterwasserfotografie – direkt in der Therme für Familien aus dem Raum Lippe.",
      featured: true,
      sortOrder: 0,
    },
  });

  const underwaterEvent = await prisma.shootingEvent.create({
    data: {
      title: "Unterwasser-Shooting Vitasol Bad Salzuflen",
      description: "Emotionale Unterwasserbilder für Kinder und Familien.",
      category: "UNDERWATER",
      shootingType: "UNDERWATER_CHILD",
      status: "PUBLISHED",
      date: new Date("2026-08-15"),
      location: "Vitasol Bad Salzuflen",
      maxParticipants: 15,
      allowWaitlist: true,
      partnerId: partner.id,
      publishedAt: new Date(),
      slots: {
        create: [
          { startTime: "09:00", endTime: "09:15", maxParticipants: 1 },
          { startTime: "09:20", endTime: "09:35", maxParticipants: 1 },
          { startTime: "09:40", endTime: "09:55", maxParticipants: 1 },
          { startTime: "10:00", endTime: "10:15", maxParticipants: 1 },
        ],
      },
    },
  });

  await prisma.shootingEvent.create({
    data: {
      title: "WeihnachtsMinis Barntrup",
      category: "SEASONAL",
      shootingType: "CHRISTMAS_MINIS",
      status: "PUBLISHED",
      date: new Date("2026-11-28"),
      location: "AquaFotos Studio Barntrup",
      maxParticipants: 12,
      allowWaitlist: true,
      publishedAt: new Date(),
    },
  });

  await prisma.shootingEvent.create({
    data: {
      title: "Kita-Fototag Beispiel-Kita",
      category: "KITA",
      shootingType: "KITA_PORTRAIT",
      status: "PUBLISHED",
      date: new Date("2026-09-10"),
      startTime: "08:00",
      endTime: "12:00",
      location: "Kita Sonnenschein, Barntrup",
      maxParticipants: 30,
      publishedAt: new Date(),
    },
  });

  await prisma.review.createMany({
    data: [
      { quote: "Vielen herzlichen Dank.", initials: "S.M.", rating: 5 },
      { quote: "Die Fotos machen Spaß.", initials: "K.B.", rating: 5 },
      {
        quote: "Das Foto ist super geworden. Vielen, vielen Dank!",
        initials: "L.H.",
        rating: 5,
      },
    ],
  });

  console.log("✅ Seed complete");
  console.log("   Admin:", admin.email, "/ admin123!");
  console.log("   Photographer:", photographer.email);
  console.log("   Sample event:", underwaterEvent.title);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
