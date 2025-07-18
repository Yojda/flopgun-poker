"use server";
import { prisma } from "@/main/utils/db";

export async function getUserById(id: number) {
  return prisma.users.findUnique({ where: { id } });
} 