import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  try {
    const problems = await prisma.problem.findMany();

    if (problems.length === 0) {
      console.log("❌ Aucun problème trouvé dans la base.");
    } else {
      console.log("📋 Problèmes dans la base :");
      problems.forEach((p) => {
        console.log(`- [${p.id}] ${p.title} | Difficulté: ${p.difficulty}`);
      });
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des problèmes :", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
