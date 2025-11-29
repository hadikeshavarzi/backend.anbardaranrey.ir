import type { CollectionConfig } from "payload";

export const Receipts: CollectionConfig = {
  slug: "receipts",

  admin: {
    useAsTitle: "receiptNo",
    group: "رسیدها",
    defaultColumns: ["receiptNo", "member", "docDate", "status"],
  },

  access: {
    read: ({ req }) => {
      if (!req.user) return false;

      return {
        member: {
          equals: req.user.id,
        },
      };
    },

    create: () => true,

    update: ({ req }) => ({
      member: {
        equals: req.user?.id,
      },
    }),

    delete: ({ req }) => ({
      member: {
        equals: req.user?.id,
      },
    }),
  },

  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        if (operation === "create") {
          const last = await req.payload.find({
            collection: "receipts" as any,
            limit: 1,
            sort: "-receiptNo",
          });

          const lastNo = last.docs?.[0]?.receiptNo ?? 0;
          data.receiptNo = Number(lastNo) + 1;
        }

        if (req.user) {
          data.member = req.user.id;
        }

        return data;
      },
    ],
  },

  fields: [
    {
      name: "receiptNo",
      type: "number",
      label: "شماره رسید",
      admin: { readOnly: true },
    },

    {
      name: "member",
      type: "relationship",
      relationTo: "members",
      required: true,
      label: "عضو",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },

    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      required: true,
      label: "وضعیت",
      options: [
        { label: "پیش نویس", value: "draft" },
        { label: "ثبت شده", value: "final" },
      ],
    },

    {
      name: "docDate",
      type: "date",
      required: true,
      label: "تاریخ سند",
    },

    {
      name: "owner",
      type: "relationship",
      relationTo: "customers",
      required: true,
      label: "مالک",
    },

    {
      name: "deliverer",
      type: "relationship",
      relationTo: "customers",
      label: "تحویل دهنده",
    },

    {
      type: "group",
      name: "driver",
      label: "راننده",
      fields: [
        { name: "name", type: "text", label: "نام" },
        { name: "nationalId", type: "text", label: "کد ملی" },
        { name: "birthDate", type: "date", label: "تاریخ تولد" },
      ],
    },

    {
      type: "group",
      name: "plate",
      label: "پلاک خودرو",
      fields: [
        { name: "iranRight", type: "text", label: "ایران - راست" },
        { name: "mid3", type: "text", label: "وسط - 3 رقم" },
        { name: "letter", type: "text", label: "حرف" },
        { name: "left2", type: "text", label: "چپ - 2 رقم" },
      ],
    },

    {
      type: "group",
      name: "finance",
      label: "اطلاعات مالی",
      fields: [
        { name: "loadCost", type: "number", label: "هزینه بارگیری", defaultValue: 0 },
        { name: "unloadCost", type: "number", label: "هزینه تخلیه", defaultValue: 0 },
        {
          name: "warehouseCost",
          type: "number",
          label: "هزینه انبارداری",
          defaultValue: 0,
        },
        { name: "tax", type: "number", label: "مالیات", defaultValue: 0 },
        { name: "returnFreight", type: "number", label: "کرایه برگشت", defaultValue: 0 },
        { name: "loadingFee", type: "number", label: "دستمزد بارگیری", defaultValue: 0 },
        { name: "miscCost", type: "number", label: "سایر هزینه‌ها", defaultValue: 0 },
        { name: "miscDescription", type: "textarea", label: "شرح سایر هزینه‌ها" },
      ],
    },

    {
      type: "group",
      name: "payment",
      label: "اطلاعات پرداخت",
      fields: [
        {
          name: "paymentBy",
          type: "select",
          label: "پرداخت توسط",
          options: [
            { label: "مشتری", value: "customer" },
            { label: "انبار", value: "warehouse" },
          ],
        },
        { name: "cardNumber", type: "text", label: "شماره کارت" },
        { name: "accountNumber", type: "text", label: "شماره حساب" },
        { name: "bankName", type: "text", label: "نام بانک" },
        { name: "ownerName", type: "text", label: "نام صاحب حساب" },
        { name: "trackingCode", type: "text", label: "کد پیگیری" },
      ],
    },

    {
      name: "items",
      type: "relationship",
      relationTo: "receiptitems" as any, // ✅ lowercase و as any
      hasMany: true,
      required: true,
      label: "اقلام رسید",
    },
  ],
};