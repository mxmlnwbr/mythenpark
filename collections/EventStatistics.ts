import type { CollectionConfig } from 'payload'

export const EventStatistics: CollectionConfig = {
  slug: 'event-statistics',
  admin: {
    useAsTitle: 'eventId',
    defaultColumns: ['eventId', 'eventTitle', 'joinCount', 'updatedAt'],
    group: 'Events',
    description: 'View event participation statistics (read-only)',
  },
  access: {
    // Admins can read statistics
    read: ({ req: { user } }) => !!user,
    // Allow API operations (create/update will be done by the API routes)
    // Note: This allows creation/updates but the admin UI fields are read-only
    create: () => true,
    update: () => true,
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
