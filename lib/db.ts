import { PrismaClient } from "@prisma/client";

// Ensure a single PrismaClient instance in dev for hot reloads
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
