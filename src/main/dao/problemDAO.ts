import { prisma } from "@/main/utils/db";
import { Problem } from "@/generated/prisma";

export class ProblemDAO {
  static async findById(id: number): Promise<Problem | null> {
    return prisma.problem.findUnique({
      where: { id },
    });
  }

  static async findAll(): Promise<Problem[]> {
    return prisma.problem.findMany({
      orderBy: { created_at: "desc" },
    });
  }

  static async create(data: {
    title: string;
    difficulty: string;
    categories: string[];
    description: string;
    replayerurl?: string;
    options?: any;
    solution?: string;
    explanation?: string;
  }): Promise<Problem> {
    return prisma.problem.create({ data });
  }

  static async update(id: number, data: Partial<Omit<Problem, "id" | "created_at" | "updated_at">>): Promise<Problem> {
    return prisma.problem.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  static async delete(id: number): Promise<void> {
    await prisma.problem.delete({ where: { id } });
  }
}
