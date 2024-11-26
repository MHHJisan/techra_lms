import { clerkClient } from "@clerk/nextjs/server"; // Correct import for Clerk API
import { prisma } from "@/lib/prisma";

import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

export async function createUserFromClerk(clerkUserId: string) {
  // Fetch user data from Clerk using clerkClient
  const user = await clerkClient.users.getUser(clerkUserId);

  // Upsert the user into your Prisma database
  await prisma.user.upsert({
    where: { clerkId: clerkUserId },
    update: {
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    },
    create: {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    },
  });
}
