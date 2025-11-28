import type { CollectionConfig } from 'payload'

export const Members: CollectionConfig = {
    slug: 'members',

    // ❌ مهم: Login/Password باید حذف شود
    auth: false,

    admin: {
        useAsTitle: 'full_name',
        group: 'مدیریت کاربران',
        defaultColumns: ['full_name', 'member_code', 'mobile', 'role', 'member_status'],
    },

    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },

    fields: [
        // نقش
        {
            name: 'role',
            type: 'select',
            required: true,
            defaultValue: 'union_member',
            label: 'نقش',
            options: [
                { label: '👑 ادمین', value: 'admin' },
                { label: '🏛️ عضو اتحادیه', value: 'union_member' },
                { label: '👤 کاربر اتحادیه', value: 'union_user' },
            ],
            admin: { position: 'sidebar' },
        },

        // ❌ ایمیل اصلاً لازم نیست
        {
            name: 'email',
            type: 'email',
            required: false,
            unique: false,
            admin: { hidden: true },
        },

        // فیلدهای اصلی
        {
            name: 'member_code',
            type: 'text',
            required: true,
            unique: true,
            label: 'کد عضویت',
        },
        {
            name: 'full_name',
            type: 'text',
            required: true,
            label: 'نام و نام خانوادگی',
        },
        {
            name: 'father_name',
            type: 'text',
            label: 'نام پدر',
        },
        {
            name: 'national_id',
            type: 'text',
            label: 'کد ملی',
        },

        // 📱 موبایل — لاگین با OTP
        {
            name: 'mobile',
            type: 'text',
            required: true,
            unique: true,
            label: 'موبایل',
        },

        {
            name: 'phone',
            type: 'text',
            label: 'تلفن ثابت',
        },
        {
            name: 'address',
            type: 'textarea',
            label: 'آدرس',
        },
        {
            name: 'birth_date',
            type: 'date',
            label: 'تاریخ تولد',
        },

        // شغلی
        {
            name: 'business_name',
            type: 'text',
            label: 'نام کسب و کار',
        },
        {
            name: 'category',
            type: 'select',
            options: [
                { label: 'انبار', value: 'warehouse' },
                { label: 'باربری', value: 'transport' },
                { label: 'سایر', value: 'other' },
            ],
            defaultValue: 'warehouse',
            label: 'دسته‌بندی',
        },

        // وضعیت
        {
            name: 'member_status',
            type: 'select',
            options: [
                { label: 'فعال', value: 'active' },
                { label: 'غیرفعال', value: 'inactive' },
                { label: 'در حال بررسی', value: 'pending' },
                { label: 'تعلیق شده', value: 'suspended' },
            ],
            defaultValue: 'active',
            label: 'وضعیت عضو',
            admin: { position: 'sidebar' },
        },

        // OTP Login
        {
            name: 'otp_code',
            type: 'text',
            admin: { hidden: true },
        },
        {
            name: 'otp_expires',
            type: 'date',
            admin: { hidden: true },
        },

        // پروانه
        {
            name: 'license_number',
            type: 'text',
            label: 'شماره پروانه',
        },
        {
            name: 'license_issue_date',
            type: 'date',
            label: 'تاریخ صدور پروانه',
        },
        {
            name: 'license_expire_date',
            type: 'date',
            label: 'تاریخ انقضای پروانه',
        },

        // تصاویر
        {
            name: 'license_image',
            type: 'upload',
            relationTo: 'media',
            label: 'تصویر پروانه',
        },
        {
            name: 'national_card_image',
            type: 'upload',
            relationTo: 'media',
            label: 'تصویر کارت ملی',
        },
        {
            name: 'id_card_image',
            type: 'upload',
            relationTo: 'media',
            label: 'تصویر شناسنامه',
        },
        {
            name: 'company_license_image',
            type: 'upload',
            relationTo: 'media',
            label: 'تصویر پروانه شرکت',
        },
        {
            name: 'member_image',
            type: 'upload',
            relationTo: 'media',
            label: 'تصویر عضو',
        },

        // اطلاعات شرکت
        {
            name: 'company_name',
            type: 'text',
            label: 'نام شرکت',
        },
        {
            name: 'registration_number',
            type: 'text',
            label: 'شماره ثبت',
        },
    ],
}
