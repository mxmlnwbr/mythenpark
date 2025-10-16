import { pgTable, integer } from 'drizzle-orm/pg-core';

export const eventVotes = pgTable('event_votes', {
  eventId: integer('event_id').primaryKey(),
  voteCount: integer('vote_count').notNull().default(0),
});

export type EventVote = typeof eventVotes.$inferSelect;
export type NewEventVote = typeof eventVotes.$inferInsert;
