import { ProblemDAO } from "@/main/dao/problemDAO";
import type { Problem } from "@/generated/prisma"; // on utilise "type" pour éviter les erreurs côté client

export class ProblemService {
  static async getProblem(id: string): Promise<Problem | null> {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return null;
    return await ProblemDAO.findById(parsedId);
  }

  static async listProblems(): Promise<Problem[]> {
    return await ProblemDAO.findAll();
  }
}
