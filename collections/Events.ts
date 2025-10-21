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
      type: 'date',
      required: true,
      label: 'Event Date',
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
    {
      name: 'duration',
      type: 'text',
      required: false,
      label: 'Duration',
      defaultValue: 'Full Day',
      admin: {
        description: 'How long the event lasts (e.g., "Full Day", "Half Day", "2 Hours")',
      },
    },
    {
      name: 'location',
      type: 'text',
      required: false,
      label: 'Location',
      defaultValue: 'Mythenpark',
      admin: {
        description: 'Where the event takes place',
      },
    },
    {
      name: 'whatToExpect',
      type: 'array',
      label: 'What to Expect',
      admin: {
        description: 'List of features/benefits participants can expect',
      },
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
          label: 'Item',
        },
      ],
      defaultValue: [
        { item: 'Professional instructors and guides' },
        { item: 'All skill levels welcome' },
        { item: 'Equipment rental available on-site' },
        { item: 'Refreshments and breaks included' },
      ],
    },
  ],
}
