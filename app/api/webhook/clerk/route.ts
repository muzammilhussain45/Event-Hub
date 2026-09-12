import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let eventType: string | undefined;

  try {
    const evt = await verifyWebhook(req);

    eventType = evt.type;
    if (evt.type === "user.created") {
      const {
        id,
        email_addresses,
        image_url,
        first_name,
        last_name,
        username,
      } = evt.data;

      const user = {
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username!,
        firstName: first_name || "Unknown",
        lastName: last_name || "User",
        photo: image_url || "https://www.gravatar.com/avatar?d=mp",
      };

      const newUser = await createUser(user);

      if (newUser) {
        const client = await clerkClient();

        await client.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });
      }
      return NextResponse.json({ message: "User created successfully", user: newUser });
    }

    if (evt.type === 'user.updated') {
      const { id, image_url, first_name, last_name, username } = evt.data

      const user = {
        firstName: first_name || "Unknown",
        lastName: last_name || "User",
        username: username!,
        photo: image_url || "https://www.gravatar.com/avatar?d=mp",
      }

      const updatedUser = await updateUser(id, user)

      return NextResponse.json({ message: 'OK', user: updatedUser })
    }

    if (evt.type === 'user.deleted') {
      const { id } = evt.data

      const deletedUser = await deleteUser(id!)

      return NextResponse.json({ message: 'OK', user: deletedUser })
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error(`Clerk webhook failed for ${eventType || "unknown event"}:`, err);
    return new Response("Webhook processing failed", { status: 500 });
  }
}