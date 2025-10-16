import { pgTable, integer, varchar, timestamp, serial } from 'drizzle-orm/pg-core';

export const eventVotes = pgTable('event_votes', {
  eventId: integer('event_id').primaryKey(),
  voteCount: integer('vote_count').notNull().default(0),
});

export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type EventVote = typeof eventVotes.$inferSelect;
export type NewEventVote = typeof eventVotes.$inferInsert;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type NewEventRegistration = typeof eventRegistrations.$inferInsert;
