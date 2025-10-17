import type { CollectionConfig } from 'payload'

export const EventRegistrations: CollectionConfig = {
  slug: 'event-registrations',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'eventId', 'createdAt'],
    group: 'Events',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'eventId',
      type: 'number',
      required: true,
      admin: {
        description: 'The ID of the event this registration is for',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
  ],
  timestamps: true,
}
