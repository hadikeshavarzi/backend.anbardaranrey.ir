import type { CollectionConfig } from 'payload'
import { checkAccess } from '../lib/accessControl'

export const ProductUnits: CollectionConfig = {
    slug: 'product-units',

    admin: {
        useAsTitle: 'name',
        group: 'انبارداری',
        defaultColumns: ['name', 'symbol', 'is_active'],
    },

    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },


    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            label: 'نام واحد',
        },
        {
            name: 'symbol',
            type: 'text',
            required: true,
            label: 'نماد واحد',
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'توضیحات',
        },
        {
            name: 'is_active',
            type: 'checkbox',
            defaultValue: true,
            label: 'فعال',
        },
    ],
}
