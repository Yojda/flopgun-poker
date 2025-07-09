import { prisma } from "@/main/utils/db";
import { ProblemDAO } from "@/main/dao/problemDAO";

beforeAll(async () => {
  // Optionnel : nettoyage ou setup si besoin
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("ProblemDAO", () => {
  let createdProblemId: number;

  it("should create a problem", async () => {
    const problem = await ProblemDAO.create({
      title: "Test Problem",
      difficulty: "Easy",
      description: "Test description",
    });
    createdProblemId = problem.id;

    expect(problem).toHaveProperty("id");
    expect(problem.title).toBe("Test Problem");
  });

  it("should find a problem by id", async () => {
    const problem = await ProblemDAO.findById(createdProblemId);
    expect(problem).not.toBeNull();
    expect(problem?.id).toBe(createdProblemId);
  });

  it("should update a problem", async () => {
    const updated = await ProblemDAO.update(createdProblemId, { title: "Updated Title" });
    expect(updated.title).toBe("Updated Title");
  });

  it("should find all problems", async () => {
    const problems = await ProblemDAO.findAll();
    console.log("Tous les problèmes trouvés :", problems);
    expect(Array.isArray(problems)).toBe(true);
    // On peut vérifier que notre problème créé est bien dans la liste
    expect(problems.some((p) => p.id === createdProblemId)).toBe(true);
  });

  it("should delete a problem", async () => {
    await ProblemDAO.delete(createdProblemId);
    const deleted = await ProblemDAO.findById(createdProblemId);
    expect(deleted).toBeNull();
  });
});
