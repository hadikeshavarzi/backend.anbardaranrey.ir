import type { CollectionConfig } from 'payload'

export const Requests: CollectionConfig = {
  slug: 'requests',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'در انتظار', value: 'pending' },
        { label: 'تایید شده', value: 'approved' },
        { label: 'رد شده', value: 'rejected' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
