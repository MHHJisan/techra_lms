import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    return <p>Redirecting...</p>;
  }

  // Fetch user details from Clerk
  const user = await clerkClient.users.getUser(userId);

  // Use the preferred username or a fallback
  const username =
    user.username ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "User";

  return (
    <div>
      <h1>
        Welcome to your dashboard,{" "}
        <span className="text-xl font-bold text-green-500">{username}!</span>
      </h1>
    </div>
  );
}
