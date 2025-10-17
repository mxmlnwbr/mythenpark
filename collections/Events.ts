import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'category', 'featured'],
  },
  access: {
    read: () => true, // Public can read events
    create: ({ req: { user } }) => !!user, // Only authenticated users (admins) can create
    update: ({ req: { user } }) => !!user, // Only authenticated users (admins) can update
    delete: ({ req: { user } }) => !!user, // Only authenticated users (admins) can delete
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Event Title',
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      label: 'Event Date',
      admin: {
        description: 'Format: Month Day, Year (e.g., December 15, 2025)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Event Description',
    },
    {
      name: 'imageUrl',
      type: 'text',
      required: true,
      label: 'Image URL',
      admin: {
        description: 'URL to the event image',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          label: '🏆 Competition',
          value: 'competition',
        },
        {
          label: '🎓 Workshop',
          value: 'workshop',
        },
        {
          label: '✨ Special',
          value: 'special',
        },
      ],
      defaultValue: 'special',
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Event',
      defaultValue: false,
      admin: {
        description: 'Mark this event as featured to highlight it',
      },
    },
  ],
}
