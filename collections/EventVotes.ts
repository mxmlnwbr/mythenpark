import type { CollectionConfig } from 'payload'

export const EventVotes: CollectionConfig = {
  slug: 'event-votes',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['eventId', 'ipAddress', 'createdAt'],
    group: 'Events',
    description: 'Track individual event votes by IP address',
    hidden: true, // Hide from main menu
  },
  access: {
    // Only API can interact with this collection
    read: ({ req: { user } }) => !user,
    create: ({ req: { user } }) => !user,
    update: ({ req: { user } }) => !user,
    delete: ({ req: { user } }) => !user,
  },
  fields: [
    {
      name: 'eventId',
      type: 'number',
      required: true,
      index: true,
      admin: {
        description: 'Event ID that was voted for',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'IP address of the voter',
      },
    },
  ],
  timestamps: true,
  indexes: [
    {
      fields: ['eventId', 'ipAddress'],
      unique: true,
    },
  ],
}
