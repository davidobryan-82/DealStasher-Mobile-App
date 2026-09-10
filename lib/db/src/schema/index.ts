import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const inboxShares = pgTable(
  "inbox_shares",
  {
    id: text("id").primaryKey(),
    shareToken: text("share_token").notNull().unique(),
    senderUserId: text("sender_user_id").notNull(),
    senderName: text("sender_name").notNull(),
    senderMessage: text("sender_message").notNull(),
    notificationTitle: text("notification_title").notNull(),
    notificationBody: text("notification_body").notNull(),
    actionUrl: text("action_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("inbox_shares_sender_user_id_idx").on(table.senderUserId)],
);

export const inboxItems = pgTable(
  "inbox_items",
  {
    id: text("id").primaryKey(),
    shareId: text("share_id")
      .notNull()
      .references(() => inboxShares.id, { onDelete: "cascade" }),
    recipientUserId: text("recipient_user_id").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  },
  (table) => [
    uniqueIndex("inbox_items_share_recipient_idx").on(table.shareId, table.recipientUserId),
    index("inbox_items_recipient_created_idx").on(table.recipientUserId, table.createdAt),
  ],
);