// Mock Prisma client for Railway deployment
export const prisma = {
  // Mock methods to prevent import errors
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
}
