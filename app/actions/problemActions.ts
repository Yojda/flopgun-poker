"use server";
import { prisma } from "@/main/utils/db";

export async function listProblems() {
  return await prisma.problem.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function getProblem(id: string) {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) return null;
  return await prisma.problem.findUnique({
    where: { id: parsedId },
  });
}

export async function addProblem(data: any) {
  return await prisma.problem.create({ data });
}

export async function editProblem(data: any) {
  return await prisma.problem.update({
    where: { id: data.id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
}

export async function deleteProblem(id: number) {
  return await prisma.problem.delete({ where: { id } });
} 