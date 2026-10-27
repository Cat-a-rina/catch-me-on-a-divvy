"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function completeOnboarding() {
  const { userId } = await auth.protect();

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { onboarded: true },
  });

  redirect("/dashboard");
}
