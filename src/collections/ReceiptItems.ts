import type { CollectionConfig } from "payload";
import { authenticateMember } from "../lib/authMembers";

export const ReceiptItems: CollectionConfig = {
  slug: "receiptitems",

  admin: {
    group: "رسیدها",
    useAsTitle: "description",
    defaultColumns: ["group", "description", "count", "unit"],
  },

  access: {
    read: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";

      // فقط وقتی هیچ‌کس لاگین نیست، ببند
      if (!memberToken && !isAdminUser) return false;

      // ادمین یا هر عضو لاگین‌شده → می‌تونه items را بخونه
      return true;
    },

    create: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";
      return !!memberToken || !!isAdminUser;
    },

    update: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";

      if (!memberToken && !isAdminUser) return false;
      if (isAdminUser) return true;

      // فعلاً اعضای عادی حق ویرایش ندارند
      return false;
    },

    delete: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";

      if (!memberToken && !isAdminUser) return false;
      if (isAdminUser) return true;

      return false;
    },
  },

  fields: [
    { name: "nationalProductId", type: "text", label: "شناسه ملی کالا" },
    { name: "productDescription", type: "text", label: "شرح کالا" },

    { name: "group", type: "text", label: "گروه کالا" },

    {
      name: "description",
      type: "text",
      required: true,
      label: "نام کالا",
    },

    {
      name: "count",
      type: "number",
      label: "تعداد",
      defaultValue: 0,
    },
    {
      name: "unit",
      type: "text",
      label: "واحد",
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

    { name: "isUsed", type: "checkbox", label: "مستعمل", defaultValue: false },
    { name: "isDefective", type: "checkbox", label: "معیوب", defaultValue: false },

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
  ],
};
