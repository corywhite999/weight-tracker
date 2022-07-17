const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  const email = "corywhite999@gmail.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("abc12345", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.weight.create({
    data: {
      amount: 200,
      date: new Date("2022-01-01"),
      userId: user.id,
    },
  });

  await prisma.weight.create({
    data: {
      amount: 201,
      date: new Date("2022-01-02"),
      userId: user.id,
    },
  });

  await prisma.weight.create({
    data: {
      amount: 201,
      date: new Date("2022-01-03"),
      userId: user.id,
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
