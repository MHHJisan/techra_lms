import { clerkClient } from "@clerk/nextjs/server"; // Correct import for Clerk API
import { db } from "@/lib/db";

export async function createUserFromClerk(clerkUserId: string) {
  // Fetch user data from Clerk using clerkClient
  const user = await clerkClient.users.getUser(clerkUserId);

  // Upsert the user into your Prisma database
  await db.user.upsert({
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
