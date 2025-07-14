"use server";
import { prisma } from "@/main/utils/db";

export async function listProblems() {
  return await prisma.problem.findMany({
    orderBy: { id: "asc" },
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
  // Valider l'ID si fourni
  if (data.id !== undefined) {
    const id = parseInt(data.id);
    if (isNaN(id) || id <= 0) {
      throw new Error("L'ID doit être un nombre entier positif");
    }

    // Vérifier si l'ID existe déjà
    const existing = await prisma.problem.findUnique({
      where: { id },
    });
    if (existing) {
      throw new Error(`Un problème avec l'ID ${id} existe déjà`);
    }

    data.id = id;
  }

  return await prisma.problem.create({ data });
}

export async function editProblem(data: any) {
  if (!data.id) {
    throw new Error("L'ID est requis pour la modification");
  }

  const newId = parseInt(data.newId?.toString() || data.id.toString());
  const currentId = parseInt(data.id.toString());

  if (isNaN(newId) || newId <= 0) {
    throw new Error("L'ID doit être un nombre entier positif");
  }

  // Si l'ID est modifié, vérifier que le nouvel ID n'existe pas déjà
  if (newId !== currentId) {
    const existing = await prisma.problem.findUnique({
      where: { id: newId },
    });
    if (existing) {
      throw new Error(`Un problème avec l'ID ${newId} existe déjà`);
    }
  }

  // Préparer les données pour la mise à jour
  const updateData = { ...data };
  delete updateData.newId;

  if (newId !== currentId) {
    // Si l'ID change, on doit d'abord créer le nouveau puis supprimer l'ancien
    await prisma.problem.create({
      data: {
        ...updateData,
        id: newId,
      },
    });
    await prisma.problem.delete({
      where: { id: currentId },
    });
    return { id: newId };
  } else {
    // Mise à jour normale sans changement d'ID
    return await prisma.problem.update({
      where: { id: currentId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    });
  }
}

export async function deleteProblem(id: number) {
  return await prisma.problem.delete({ where: { id } });
}
