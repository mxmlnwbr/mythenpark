import type { CollectionConfig, CollectionSlug } from "payload";

const parkStatusSlug = "park-status" as CollectionSlug;

export const ParkStatus: CollectionConfig = {
  slug: parkStatusSlug,
  admin: {
    useAsTitle: "status",
    defaultColumns: ["status", "updatedAt"],
  },
  access: {
    read: () => true, // Public read access
    create: async ({ req }) => {
      if (!req.user) return false;

      const existing = await req.payload.find({
        collection: parkStatusSlug,
        limit: 1,
      });

      return existing.totalDocs === 0;
    },
    update: ({ req: { user } }) => !!user, // Only authenticated users can update
    delete: ({ req: { user } }) => !!user, // Only authenticated users can delete
  },
  hooks: {
    beforeChange: [
      async ({ req, operation }) => {
        if (operation !== "create") return;

        const existing = await req.payload.find({
          collection: parkStatusSlug,
          limit: 1,
        });

        if (existing.totalDocs > 0) {
          throw new Error(
            "Only one park status entry is allowed. Edit the existing record instead."
          );
        }
      },
    ],
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
