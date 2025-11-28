import type { CollectionConfig } from "payload";

export const Customers: CollectionConfig = {
    slug: "customers",
    labels: {
        singular: "مشتری",
        plural: "مشتریان",
    },

    admin: {
        useAsTitle: "name",
        group: "مدیریت انبار",
        defaultColumns: ["name", "customerType", "nationalId", "mobile"],
    },

    access: {
        create: () => true,
        read: () => true,
        update: () => true,
        delete: () => true,
    },

    fields: [
        // نوع مشتری
        {
            name: "customerType",
            type: "select",
            label: "نوع مشتری",
            required: true,
            defaultValue: "real",
            options: [
                { label: "حقیقی", value: "real" },
                { label: "حقوقی", value: "company" },
            ],
        },

        // نام/شرکت
        {
            name: "name",
            type: "text",
            label: "نام / شرکت",
            required: true,
            localized: false,
        },

        // کد ملی / شناسه ملی
        {
            name: "nationalId",
            type: "text",
            label: "کد ملی / شناسه ملی",
            required: false,
            admin: {
                placeholder: "برای حقوقی: شناسه ملی",
            },
        },

        // موبایل
        {
            name: "mobile",
            type: "text",
            label: "موبایل",
            required: false,
        },

        // تلفن ثابت
        {
            name: "phone",
            type: "text",
            label: "تلفن ثابت",
            required: false,
        },

        // شماره اقتصادی
        {
            name: "economicCode",
            type: "text",
            label: "شماره اقتصادی",
            required: false,
        },

        // کد پستی
        {
            name: "postalCode",
            type: "text",
            label: "کد پستی",
        },

        // تاریخ تولد / ثبت
        {
            name: "birthOrRegisterDate",
            type: "date",
            label: "تاریخ تولد / ثبت",
            admin: {
                date: {
                    displayFormat: "YYYY/MM/DD",
                },
            },
        },

        // آدرس کامل
        {
            name: "address",
            type: "textarea",
            label: "آدرس کامل",
            required: false,
        },

        // توضیحات
        {
            name: "description",
            type: "textarea",
            label: "توضیحات",
        },
    ],
};

export default Customers;
