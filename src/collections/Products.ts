import type { CollectionConfig } from 'payload'
import { checkAccess } from '../lib/accessControl'

export const Products: CollectionConfig = {
    slug: 'products',

    admin: {
        useAsTitle: 'name',
        group: 'انبارداری',
        defaultColumns: ['name', 'sku', 'category', 'quantity', 'member'],
    },

    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },


    hooks: {
        beforeChange: [
            ({ req, operation, data }) => {
                // تنظیم مالک هنگام ایجاد
                if (operation === 'create' && req.user) {
                    data.member = req.user.id
                }
                return data
            },
        ],
    },

    fields: [
        { name: 'name', type: 'text', required: true, label: 'نام کالا' },
        {
            name: 'sku',
            type: 'text',
            required: true,
            unique: true,
            label: 'کد کالا (SKU)',
        },
        {
            name: 'category',
            type: 'relationship',
            relationTo: 'product-categories',
            required: true,
            label: 'دسته‌بندی',
        },
        {
            name: 'unit',
            type: 'relationship',
            relationTo: 'product-units',
            required: true,
            label: 'واحد',
        },
        {
            name: 'quantity',
            type: 'number',
            required: true,
            defaultValue: 0,
            label: 'موجودی فعلی',
        },
        { name: 'min_stock', type: 'number', defaultValue: 0, label: 'حداقل موجودی' },
        { name: 'max_stock', type: 'number', label: 'حداکثر موجودی' },
        { name: 'location', type: 'text', label: 'موقعیت در انبار' },
        { name: 'price', type: 'number', label: 'قیمت (تومان)' },
        { name: 'cost_price', type: 'number', label: 'قیمت تمام‌شده' },
        { name: 'description', type: 'textarea', label: 'توضیحات' },
        { name: 'specifications', type: 'textarea', label: 'مشخصات فنی' },
        {
            name: 'images',
            type: 'upload',
            relationTo: 'media',
            hasMany: true,
            label: 'تصاویر کالا',
        },
        { name: 'barcode', type: 'text', label: 'بارکد' },
        { name: 'batch_number', type: 'text', label: 'شماره بچ' },
        { name: 'expire_date', type: 'date', label: 'تاریخ انقضا' },
        {
            name: 'member',
            type: 'relationship',
            relationTo: 'members',
            label: 'مالک کالا',
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
        },
        { name: 'is_active', type: 'checkbox', defaultValue: true, label: 'فعال' },
        { name: 'notes', type: 'textarea', label: 'یادداشت‌ها' },
    ],
}