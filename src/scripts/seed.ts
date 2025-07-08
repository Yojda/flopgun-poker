// scripts/seed.ts
import { prisma } from '@/utils/db';

async function main() {
  await prisma.user.create({
    data: {
      username: 'Alice',
      password: 'test',  // En prod, hash le password !!
      email: 'test@gmail.com',
    },
  });
  console.log('User seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
