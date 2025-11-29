import type { CollectionConfig } from "payload";

export const ReceiptItems: CollectionConfig = {
  slug: "receiptitems", // ✅ همه lowercase

  admin: {
    group: "رسیدها",
    useAsTitle: "description",
    defaultColumns: ["description", "count", "unit", "weights.netWeight"],
  },

  access: {
    // فقط آیتم‌های متعلق به Member خودش را ببیند
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
      async ({ req, data }) => {
        // ست کردن Member
        if (req.user) {
          data.member = req.user.id;
        }
        return data;
      },
    ],
  },

  fields: [
    { 
      name: "nationalProductId", 
      type: "text", 
      label: "شناسه ملی کالا" 
    },
    { 
      name: "productDescription", 
      type: "text", 
      label: "شرح کالا" 
    },
    { 
      name: "group", 
      type: "text", 
      label: "گروه کالا" 
    },

    // نام کالا
    {
      name: "description",
      type: "text",
      required: true,
      label: "نام کالا",
    },

    // تعداد و واحد
    { 
      name: "count", 
      type: "number", 
      label: "تعداد",
      defaultValue: 0,
    },
    { 
      name: "unit", 
      type: "text", 
      label: "واحد" 
    },

    {
      name: "productionType",
      type: "select",
      label: "نوع تولید",
      options: [
        { label: "داخلی", value: "domestic" },
        { label: "وارداتی", value: "import" },
      ],
    },

    { 
      name: "isUsed", 
      type: "checkbox", 
      label: "مستعمل", 
      defaultValue: false 
    },
    { 
      name: "isDefective", 
      type: "checkbox", 
      label: "معیوب", 
      defaultValue: false 
    },

    {
      type: "group",
      name: "weights",
      label: "وزن‌ها",
      fields: [
        { name: "fullWeight", type: "number", label: "وزن پر", defaultValue: 0 },
        { name: "emptyWeight", type: "number", label: "وزن خالی", defaultValue: 0 },
        { name: "netWeight", type: "number", label: "وزن خالص", defaultValue: 0 },
        { name: "originWeight", type: "number", label: "وزن مبدأ", defaultValue: 0 },
        { name: "weightDiff", type: "number", label: "اختلاف وزن", defaultValue: 0 },
      ],
    },

    {
      type: "group",
      name: "dimensions",
      label: "ابعاد",
      fields: [
        { name: "length", type: "number", label: "طول", defaultValue: 0 },
        { name: "width", type: "number", label: "عرض", defaultValue: 0 },
        { name: "thickness", type: "number", label: "ضخامت", defaultValue: 0 },
      ],
    },

    { name: "heatNumber", type: "text", label: "Heat No" },
    { name: "bundleNo", type: "text", label: "شماره بسته" },
    { name: "brand", type: "text", label: "برند / کارخانه" },
    { name: "orderNo", type: "text", label: "شماره سفارش" },
    { name: "depoLocation", type: "text", label: "محل دپو" },

    { name: "descriptionNotes", type: "textarea", label: "توضیحات" },

    { name: "row", type: "text", label: "ردیف" },

    // بسیار مهم: عضو صاحب این آیتم
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
  ],
};