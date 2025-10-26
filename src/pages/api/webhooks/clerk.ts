// /pages/api/webhooks/clerk.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/prisma";
import type { WebhookEvent } from "@clerk/nextjs/server";

// Si necesitas el body sin parsear para verificar firma:
// export const config = { api: { bodyParser: false } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const evt = req.body as WebhookEvent;
    const maybeId = evt.data?.id;

    if (typeof maybeId !== "string" || maybeId.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing or invalid clerk user id" });
    }
    const clerkUserId = maybeId;

    switch (evt.type) {
      case "user.created":
        await prisma.user.upsert({
          where: { clerkUserId },
          update: {},
          create: { clerkUserId },
        });
        break;
      case "user.deleted":
        await prisma.user.delete({
          where: { clerkUserId },
        });
        break;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}
