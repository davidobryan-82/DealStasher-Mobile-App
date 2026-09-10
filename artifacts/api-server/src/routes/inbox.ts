import { randomBytes, randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { CreateInboxShareBody } from "@workspace/api-zod";
import { db, inboxItems, inboxShares } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";

const router: IRouter = Router();
const publicAppUrl = (process.env.DEALSTASHER_PUBLIC_URL ?? "https://www.dealstasher.com").replace(/\/+$/, "");

const getUserId = (request: Parameters<typeof requireAuth>[0]) =>
  (request as AuthenticatedRequest).userId;

const serializeInboxItem = (item: {
  id: string;
  shareToken: string;
  senderName: string;
  senderMessage: string;
  notificationTitle: string;
  notificationBody: string;
  actionUrl: string | null;
  createdAt: Date;
  readAt: Date | null;
}) => ({
  id: item.id,
  token: item.shareToken,
  senderName: item.senderName,
  message: item.senderMessage,
  notificationTitle: item.notificationTitle,
  notificationBody: item.notificationBody,
  actionUrl: item.actionUrl,
  createdAt: item.createdAt.toISOString(),
  readAt: item.readAt?.toISOString() ?? null,
});

router.get("/inbox", requireAuth, async (request, response, next) => {
  try {
    const items = await db
      .select({
        id: inboxItems.id,
        shareToken: inboxShares.shareToken,
        senderName: inboxShares.senderName,
        senderMessage: inboxShares.senderMessage,
        notificationTitle: inboxShares.notificationTitle,
        notificationBody: inboxShares.notificationBody,
        actionUrl: inboxShares.actionUrl,
        createdAt: inboxShares.createdAt,
        readAt: inboxItems.readAt,
      })
      .from(inboxItems)
      .innerJoin(inboxShares, eq(inboxItems.shareId, inboxShares.id))
      .where(eq(inboxItems.recipientUserId, getUserId(request)))
      .orderBy(desc(inboxShares.createdAt));

    response.json({ items: items.map(serializeInboxItem) });
  } catch (error) {
    next(error);
  }
});

router.post("/inbox", requireAuth, async (request, response, next) => {
  try {
    const parsed = CreateInboxShareBody.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ message: "The share message is invalid." });
      return;
    }

    const shareToken = randomBytes(24).toString("base64url");
    const createdAt = new Date();
    await db.insert(inboxShares).values({
      id: randomUUID(),
      shareToken,
      senderUserId: getUserId(request),
      senderName: parsed.data.senderName.trim(),
      senderMessage: parsed.data.message.trim(),
      notificationTitle: parsed.data.notificationTitle.trim(),
      notificationBody: parsed.data.notificationBody.trim(),
      actionUrl: parsed.data.actionUrl ?? null,
      createdAt,
    });

    response.status(201).json({
      token: shareToken,
      url: `${publicAppUrl}/inbox/${shareToken}`,
      createdAt: createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/inbox/shared/:token", async (request, response, next) => {
  try {
    const token = String(request.params.token);
    const [share] = await db
      .select()
      .from(inboxShares)
      .where(eq(inboxShares.shareToken, token))
      .limit(1);

    if (!share) {
      response.status(404).json({ message: "This shared notification is no longer available." });
      return;
    }

    response.json({
      token: share.shareToken,
      senderName: share.senderName,
      message: share.senderMessage,
      notificationTitle: share.notificationTitle,
      notificationBody: share.notificationBody,
      actionUrl: share.actionUrl,
      createdAt: share.createdAt.toISOString(),
      claimed: false,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/inbox/shared/:token/claim", requireAuth, async (request, response, next) => {
  try {
    const token = String(request.params.token);
    const [share] = await db
      .select()
      .from(inboxShares)
      .where(eq(inboxShares.shareToken, token))
      .limit(1);

    if (!share) {
      response.status(404).json({ message: "This shared notification is no longer available." });
      return;
    }

    const recipientUserId = getUserId(request);
    const inboxItemId = randomUUID();
    await db
      .insert(inboxItems)
      .values({
        id: inboxItemId,
        shareId: share.id,
        recipientUserId,
      })
      .onConflictDoNothing({
        target: [inboxItems.shareId, inboxItems.recipientUserId],
      });

    const [item] = await db
      .select({
        id: inboxItems.id,
        shareToken: inboxShares.shareToken,
        senderName: inboxShares.senderName,
        senderMessage: inboxShares.senderMessage,
        notificationTitle: inboxShares.notificationTitle,
        notificationBody: inboxShares.notificationBody,
        actionUrl: inboxShares.actionUrl,
        createdAt: inboxShares.createdAt,
        readAt: inboxItems.readAt,
      })
      .from(inboxItems)
      .innerJoin(inboxShares, eq(inboxItems.shareId, inboxShares.id))
      .where(
        and(
          eq(inboxItems.shareId, share.id),
          eq(inboxItems.recipientUserId, recipientUserId),
        ),
      )
      .limit(1);

    response.status(201).json(serializeInboxItem(item));
  } catch (error) {
    next(error);
  }
});

router.post("/inbox/:id/read", requireAuth, async (request, response, next) => {
  try {
    const id = String(request.params.id);
    const result = await db
      .update(inboxItems)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(inboxItems.id, id),
          eq(inboxItems.recipientUserId, getUserId(request)),
        ),
      );

    if (result.rowCount === 0) {
      response.status(404).json({ message: "Inbox message not found." });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;