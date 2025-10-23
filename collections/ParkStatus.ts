import type { CollectionConfig } from "payload";

export const ParkStatus: CollectionConfig = {
  slug: "park-status",
  admin: {
    useAsTitle: "status",
    defaultColumns: ["status", "updatedAt"],
  },
  access: {
    read: () => true, // Public read access
    create: ({ req: { user } }) => !!user, // Only authenticated users can create
    update: ({ req: { user } }) => !!user, // Only authenticated users can update
    delete: ({ req: { user } }) => !!user, // Only authenticated users can delete
  },
  fields: [
    {
      name: "status",
      type: "select",
      required: true,
      options: [
        {
          label: "Open",
          value: "open",
        },
        {
          label: "Closed",
          value: "closed",
        },
      ],
      defaultValue: "closed",
      admin: {
        description: "Current status of the park",
      },
    },
    {
      name: "message",
      type: "text",
      admin: {
        description:
          'Optional message to display with the status (e.g., "Opening at 9 AM")',
      },
    },
  ],
  timestamps: true,
};
