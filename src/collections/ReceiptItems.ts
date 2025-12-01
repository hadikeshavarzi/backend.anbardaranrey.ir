import type { CollectionConfig } from "payload";
import { authenticateMember } from "../lib/authMembers";

export const ReceiptItems: CollectionConfig = {
  slug: "receiptitems",

  admin: {
    group: "رسیدها",
    useAsTitle: "product_description",
    defaultColumns: ["product", "national_product_id", "count", "weights.netWeight"],
  },

  access: {
    read: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";
      return !!memberToken || !!isAdminUser;
    },
    create: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";
      return !!memberToken || !!isAdminUser;
    },
    update: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";
      return !!memberToken || !!isAdminUser;
    },
    delete: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";
      return !!memberToken || !!isAdminUser;
    },
  },

  fields: [
    // 🔥 رابطه واقعی به محصولات
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      label: "کالای انتخاب‌شده",
    },

    // 🔥 شناسه ملی کالا (از API سامانه جامع)
    {
      name: "national_product_id",
      type: "text",
      label: "شناسه ملی کالا",
    },

    // 🔥 شرح کالا از سامانه جامع
    {
      name: "product_description",
      type: "text",
      label: "شرح کالا (سامانه جامع)",
    },

    // مقدار
    { name: "count", type: "number", label: "تعداد", defaultValue: 0 },

    // تولید
    {
      name: "productionType",
      type: "select",
      label: "نوع تولید",
      options: [
        { label: "داخلی", value: "domestic" },
        { label: "وارداتی", value: "import" },
      ],
    },

    // وضعیت‌ها
    { name: "isUsed", type: "checkbox", defaultValue: false, label: "مستعمل" },
    { name: "isDefective", type: "checkbox", defaultValue: false, label: "معیوب" },

    // وزن‌ها
    {
      type: "group",
      name: "weights",
      label: "وزن‌ها",
      fields: [
        { name: "fullWeight", type: "number", defaultValue: 0, label: "وزن پر" },
        { name: "emptyWeight", type: "number", defaultValue: 0, label: "وزن خالی" },
        { name: "netWeight", type: "number", defaultValue: 0, label: "وزن خالص" },
        { name: "originWeight", type: "number", defaultValue: 0, label: "وزن مبدأ" },
        { name: "weightDiff", type: "number", defaultValue: 0, label: "اختلاف وزن" },
      ],
    },

    // ابعاد
    {
      type: "group",
      name: "dimensions",
      label: "ابعاد",
      fields: [
        { name: "length", type: "number", defaultValue: 0, label: "طول" },
        { name: "width", type: "number", defaultValue: 0, label: "عرض" },
        { name: "thickness", type: "number", defaultValue: 0, label: "ضخامت" },
      ],
    },

    { name: "heatNumber", type: "text", label: "Heat No" },
    { name: "bundleNo", type: "text", label: "شماره بسته" },
    { name: "brand", type: "text", label: "برند" },
    { name: "orderNo", type: "text", label: "شماره سفارش" },
    { name: "depoLocation", type: "text", label: "محل دپو" },

    { name: "descriptionNotes", type: "textarea", label: "توضیحات" },

    { name: "row", type: "text", label: "ردیف" },
  ],
};
