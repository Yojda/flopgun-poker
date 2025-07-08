import { prisma } from '@/utils/db';

export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({ where: { id } });
};