import type { CollectionConfig } from 'payload'

export const EventVotes: CollectionConfig = {
  slug: 'event-votes',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['eventId', 'eventTitle', 'ipAddress', 'createdAt'],
    group: 'Events',
    description: 'Track individual event votes by IP address (view-only)',
  },
  access: {
    // Admins can only view individual votes
    read: ({ req: { user } }) => !!user,
    // Only API can create/update/delete
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
        readOnly: true,
      },
    },
    {
      name: 'eventTitle',
      type: 'text',
      admin: {
        description: 'Event title for reference',
        readOnly: true,
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'IP address of the voter',
        readOnly: true,
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
