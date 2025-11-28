import type { CollectionConfig } from 'payload'

export const Permissions: CollectionConfig = {
    slug: 'permissions',

    admin: {
        useAsTitle: 'title',
        group: 'تنظیمات سیستم',
        defaultColumns: ['title', 'role', 'collection_name', 'is_active'],
    },

    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,

    },

    hooks: {
        beforeChange: [
            ({ data, operation }) => {
                if (operation === 'create' || operation === 'update') {
                    const roleLabels: Record<string, string> = {
                        admin: 'ادمین',
                        union_member: 'عضو اتحادیه',
                        union_user: 'کاربر اتحادیه',
                    }
                    data.title = `${roleLabels[data.role] || data.role} - ${data.collection_name}`
                }
                return data
            },
        ],
    },

    fields: [
        {
            name: 'title',
            type: 'text',
            label: 'عنوان',
            admin: {
                readOnly: true,
                position: 'sidebar',
            },
        },

        {
            type: 'row',
            fields: [
                {
                    name: 'role',
                    type: 'select',
                    required: true,
                    label: 'نقش',
                    options: [
                        { label: '👑 ادمین', value: 'admin' },
                        { label: '🏛️ عضو اتحادیه', value: 'union_member' },
                        { label: '👤 کاربر اتحادیه', value: 'union_user' },
                    ],
                    admin: { width: '50%' },
                },
                {
                    name: 'collection_name',
                    type: 'select',
                    required: true,
                    label: 'فرم / کالکشن',
                    options: [
                        { label: '📦 محصولات', value: 'products' },
                        { label: '📁 دسته‌بندی کالا', value: 'product-categories' },
                        { label: '📏 واحد کالا', value: 'product-units' },
                        { label: '📥 ورود کالا', value: 'inventory-entries' },
                        { label: '📤 خروج کالا', value: 'inventory-exits' },
                        { label: '🔄 انتقال کالا', value: 'inventory-transfers' },
                        { label: '🧾 فاکتورها', value: 'invoices' },
                        { label: '💰 پرداخت‌ها', value: 'payments' },
                        { label: '📊 گزارشات', value: 'reports' },
                        { label: '👥 اعضا', value: 'members' },
                        { label: '🖼️ رسانه‌ها', value: 'media' },
                    ],
                    admin: { width: '50%' },
                },
            ],
        },

        {
            name: 'actions',
            type: 'group',
            label: 'دسترسی‌ها',
            fields: [
                {
                    type: 'row',
                    fields: [
                        { name: 'can_read', type: 'checkbox', defaultValue: true, label: '👁️ مشاهده', admin: { width: '25%' } },
                        { name: 'can_create', type: 'checkbox', defaultValue: false, label: '➕ ایجاد', admin: { width: '25%' } },
                        { name: 'can_update', type: 'checkbox', defaultValue: false, label: '✏️ ویرایش', admin: { width: '25%' } },
                        { name: 'can_delete', type: 'checkbox', defaultValue: false, label: '🗑️ حذف', admin: { width: '25%' } },
                    ],
                },
            ],
        },

        {
            name: 'restrictions',
            type: 'group',
            label: 'محدودیت‌ها',
            fields: [
                {
                    name: 'only_own',
                    type: 'checkbox',
                    defaultValue: true,
                    label: 'فقط رکوردهای خودش',
                },
                {
                    name: 'owner_field',
                    type: 'text',
                    defaultValue: 'member',
                    label: 'نام فیلد مالکیت',
                    admin: {
                        condition: (data) => data?.restrictions?.only_own === true,
                    },
                },
            ],
        },

        {
            name: 'field_access',
            type: 'group',
            label: 'دسترسی فیلدها',
            fields: [
                { name: 'visible_fields', type: 'textarea', label: 'فیلدهای قابل مشاهده' },
                { name: 'hidden_fields', type: 'textarea', label: 'فیلدهای مخفی' },
            ],
        },

        { name: 'is_active', type: 'checkbox', defaultValue: true, label: 'فعال', admin: { position: 'sidebar' } },
        { name: 'priority', type: 'number', defaultValue: 0, label: 'اولویت', admin: { position: 'sidebar' } },
    ],
}