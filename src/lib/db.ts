import { PrismaClient } from '@/generated/prisma';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const Prismadb = globalForPrisma.prisma ?? prismaClientSingleton();

export default Prismadb;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = Prismadb;
}