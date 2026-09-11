import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  phone: text('phone').unique(),
  email: text('email'),
  name: text('name'),
  gender: text('gender'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  slug: text('slug').notNull(),
  userId: integer('user_id').references(() => users.id),
  senderName: text('sender_name').default('کاربر biaDate'),
  recipientName: text('recipient_name').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('pending'),
  preferences: jsonb('preferences'),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  invitations: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  user: one(users, {
    fields: [invitations.userId],
    references: [users.id],
  }),
}));
