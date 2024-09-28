// Create a connection to Prisma Client
// ensures that PrismaClient is instantiated once and can be reused across your application

import { PrismaClient } from '@prisma/client';

// Instantiate PrismaClient 
const prisma = new PrismaClient()

// let prisma: PrismaClient;

// if (process.env.NODE_ENV === 'production') {
//   prisma = new PrismaClient();
// } else {
//   if (!global.prisma) {
//     global.prisma = new PrismaClient();
//   }
//   prisma = global.prisma;
// }

export default prisma;