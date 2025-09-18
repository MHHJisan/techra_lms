import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const names = ["Chemistry", "Skill Development"];
  for (const name of names) {
    const result = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`Upserted category: ${result.name} (id: ${result.id})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
