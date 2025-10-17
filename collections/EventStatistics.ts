import type { CollectionConfig } from 'payload'

export const EventStatistics: CollectionConfig = {
  slug: 'event-statistics',
  admin: {
    useAsTitle: 'eventId',
    defaultColumns: ['eventId', 'eventTitle', 'joinCount', 'updatedAt'],
    group: 'Events',
    description: 'View event participation statistics (automatically managed by API)',
  },
  access: {
    // Admins can read statistics
    read: ({ req: { user } }) => !!user,
    // Block admin UI from creating/updating, but allow API (when req.user is undefined)
    create: ({ req: { user } }) => !user, // Only API (no user context) can create
    update: ({ req: { user } }) => !user, // Only API (no user context) can update
    delete: ({ req: { user } }) => !!user, // Only admins can delete
  },
  fields: [
    {
      name: 'eventId',
      type: 'number',
      required: true,
      unique: true,
      admin: {
        description: 'Event ID (automatically synced)',
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
      name: 'joinCount',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Number of users who clicked "Join Event"',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
