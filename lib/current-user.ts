import { auth } from "@clerk/nextjs/server";

import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";

/**
 * Resolve the signed-in Clerk user to the `_id` of their document in MongoDB.
 *
 * Server components get Clerk's `userId` (e.g. `user_2abc...`), but events,
 * orders and the event form all reference the Mongo `User` by its ObjectId.
 * The clerk webhook stashes that ObjectId on the user's public metadata, so
 * prefer it and fall back to a lookup by `clerkId` when it is missing (e.g.
 * the webhook never ran for a preexisting account).
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const { userId, sessionClaims } = await auth();

  if (!userId) return null;

  const metadataUserId = (sessionClaims?.metadata as { userId?: string } | undefined)?.userId;

  if (metadataUserId) return metadataUserId;

  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    return user ? user._id.toString() : null;
  } catch (error) {
    console.error("Failed to resolve the current user", error);
    return null;
  }
};
