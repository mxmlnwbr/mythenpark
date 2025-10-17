import type { CollectionConfig } from 'payload'

export const EventRegistrations: CollectionConfig = {
  slug: 'event-registrations',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'eventId', 'createdAt'],
    group: 'Events',
    description: 'Manage event registrations and view who has signed up',
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
      admin: {
        description: 'First name of the registrant',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      maxLength: 100,
      admin: {
        description: 'Last name of the registrant',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Email address of the registrant',
      },
    },
  ],
  timestamps: true,
}
