import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
    id: text("id").notNull().primaryKey(),
    twitch_id: text("twitch_id"),
    twitch_username: text("twitch_username")
})

export const sessions = sqliteTable("session", {
    id: text("id").notNull().primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    expiresAt: integer("expires_at").notNull()
})