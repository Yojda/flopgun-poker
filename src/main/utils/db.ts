import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // @ts-ignore
  const { PrismaNeon } = require('@prisma/adapter-neon');
  const { neonConfig } = require('@neondatabase/serverless');
  const ws = require('ws');

  neonConfig.webSocketConstructor = ws;

  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  prisma = new PrismaClient({ adapter });
} else {
  prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;
}

export { prisma };
