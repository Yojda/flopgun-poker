import { ProblemService } from "@/main/services/problemService";
import { ProblemDAO } from "@/main/dao/problemDAO";

// Mock du DAO pour isoler le service
jest.mock("@/main/dao/problemDAO");

describe("ProblemService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("listProblems", () => {
    it("should return a list of problems", async () => {
      // Données mockées
      const mockProblems = [
        { id: 1, title: "Problem 1", difficulty: "Easy", categories: ["Pot Open"] },
        { id: 2, title: "Problem 2", difficulty: "Medium", categories: ["Pot 3bet"] },
      ];

      // On fait en sorte que findAll retourne mockProblems
      (ProblemDAO.findAll as jest.Mock).mockResolvedValue(mockProblems);

      const problems = await ProblemService.listProblems();

      expect(problems).toEqual(mockProblems);
      expect(ProblemDAO.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("getProblem", () => {
    it("should return a problem by id", async () => {
      const mockProblem = { id: 1, title: "Problem 1", difficulty: "Easy" };

      (ProblemDAO.findById as jest.Mock).mockResolvedValue(mockProblem);

      const problem = await ProblemService.getProblem("1");

      expect(problem).toEqual(mockProblem);
      expect(ProblemDAO.findById).toHaveBeenCalledWith(1);
    });

    it("should return null if id is not a number", async () => {
      const problem = await ProblemService.getProblem("abc");
      expect(problem).toBeNull();
      expect(ProblemDAO.findById).not.toHaveBeenCalled();
    });

    it("should return null if problem not found", async () => {
      (ProblemDAO.findById as jest.Mock).mockResolvedValue(null);
      const problem = await ProblemService.getProblem("999");
      expect(problem).toBeNull();
      expect(ProblemDAO.findById).toHaveBeenCalledWith(999);
    });
  });
});
