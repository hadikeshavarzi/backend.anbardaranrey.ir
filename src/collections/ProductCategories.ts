import type { CollectionConfig } from 'payload'
import { checkAccess } from '../lib/accessControl'

export const ProductCategories: CollectionConfig = {
    slug: 'product-categories',

    admin: {
        useAsTitle: 'name',
        group: 'انبارداری',
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
            label: 'نام دسته‌بندی',
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            label: 'نامک',
        },
        {
            name: 'parent',
            type: 'relationship',
            relationTo: 'product-categories',
            label: 'دسته والد',
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'توضیحات',
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            label: 'تصویر',
        },
        {
            name: 'is_active',
            type: 'checkbox',
            defaultValue: true,
            label: 'فعال',
        },
        {
            name: 'sort_order',
            type: 'number',
            defaultValue: 0,
            label: 'ترتیب',
        },
        {
            name: 'storage_cost',
            type: 'number',
            label: 'هزینه انبارداری',
        },
        {
            name: 'loading_cost',
            type: 'number',
            label: 'هزینه بارگیری',
        },
    ],
}