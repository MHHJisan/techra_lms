const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    await database.category.createMany({
      data: [
        { name: "Accounting" },
        { name: "Art & Design" },
        { name: "Astronomy" },

        { name: "Computer Science" },
        { name: "Computer Science & Engineering" },

        { name: "Data Science" },

        { name: "Engineering" },
        { name: "Electric and Electronics Engineering" },

        { name: "Fitness" },
        { name: "Filming" },

        { name: "Industrial and Production Engineering" },

        { name: "Literature" },

        { name: "Mathematics" },
        { name: "Music" },

        { name: "Physics" },
        { name: "Photography" },
      ],
      skipDuplicates: true, // Ignore duplicate entries
    });

    console.log("Success");
  } catch (error) {
    console.log(" Error seeding the database categories", error);
  } finally {
    await database.$disconnect();
  }
}

main();
