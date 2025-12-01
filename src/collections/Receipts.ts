import type { CollectionConfig } from "payload";
import { authenticateMember } from "../lib/authMembers";

export const Receipts: CollectionConfig = {
  slug: "receipts",

  admin: {
    useAsTitle: "receiptNo",
    group: "رسیدها",
    defaultColumns: ["receiptNo", "member", "docDate", "status"],
  },

  /* ========================
        ACCESS CONTROL
  =========================*/
  access: {
    read: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";

      if (!memberToken && !isAdminUser) return false;

      if (isAdminUser) return true;
      if (memberToken?.role === "admin") return true;

      return true; // برای ساده‌سازی فعلاً همه رسیدها برای اعضا قابل مشاهده است
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
      if (isAdminUser || memberToken?.role === "admin") return true;

      return true;
    },

    delete: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";

      if (!memberToken && !isAdminUser) return false;
      if (isAdminUser || memberToken?.role === "admin") return true;

      return false; // اعضای عادی اجازه حذف ندارند
    },
  },

  /* ========================
            HOOKS
  =========================*/
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

          const memberToken = authenticateMember(req);
          if (memberToken) {
            data.member = memberToken.id;
            console.log("✅ Member set in hook:", memberToken.id);
          }
        }

        return data;
      },
    ],
  },

  /* ========================
            FIELDS
  =========================*/
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
      admin: { position: "sidebar", readOnly: true },
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

    /* ========================
        🔵 سند مرجع (refDocument)
    =========================*/
    {
      name: "refDocument",
      type: "group",
      label: "سند مرجع",
      fields: [
        {
          name: "refType",
          type: "select",
          label: "نوع سند مرجع",
          required: true,
          defaultValue: "none",
          options: [
            { label: "بدون مرجع", value: "none" },
            { label: "بارنامه", value: "barnameh" },
            { label: "پته گمرکی", value: "petteh" },
            { label: "حواله سامانه جامع", value: "havale" },
            { label: "اظهار تولید", value: "production" },
          ],
        },

        // ───── بارنامه ─────
        { name: "barnamehNumber", type: "text", label: "شماره بارنامه" },
        { name: "barnamehDate", type: "date", label: "تاریخ صدور بارنامه" },
        { name: "barnamehTracking", type: "text", label: "کد رهگیری بارنامه" },

        // ───── پته گمرکی ─────
        { name: "pettehNumber", type: "text", label: "شماره پته" },

        // ───── حواله سامانه جامع ─────
        { name: "havaleNumber", type: "text", label: "شماره حواله" },

        // ───── اظهار تولید ─────
        { name: "productionNumber", type: "text", label: "شماره اظهار تولید" },
      ],
    },

    /* ========================
        🔵 صاحب کالا
    =========================*/
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

    /* ========================
        🔵 راننده
    =========================*/
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

    /* ========================
        🔵 پلاک خودرو
    =========================*/
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

    /* ========================
        🔵 هزینه‌ها
    =========================*/
    {
      type: "group",
      name: "finance",
      label: "اطلاعات مالی",
      fields: [
        { name: "loadCost", type: "number", label: "هزینه بارگیری", defaultValue: 0 },
        { name: "unloadCost", type: "number", label: "هزینه تخلیه", defaultValue: 0 },
        { name: "warehouseCost", type: "number", label: "هزینه انبارداری", defaultValue: 0 },
        { name: "tax", type: "number", label: "مالیات", defaultValue: 0 },
        { name: "returnFreight", type: "number", label: "کرایه برگشت", defaultValue: 0 },
        { name: "loadingFee", type: "number", label: "دستمزد بارگیری", defaultValue: 0 },
        { name: "miscCost", type: "number", label: "سایر هزینه‌ها", defaultValue: 0 },
        { name: "miscDescription", type: "textarea", label: "شرح سایر هزینه‌ها" },
      ],
    },

    /* ========================
        🔵 پرداخت
    =========================*/
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

    /* ========================
        🔵 آیتم‌های رسید
    =========================*/
    {
      name: "items",
      type: "relationship",
      relationTo: "receiptitems",
      hasMany: true,
      required: false,
      label: "اقلام رسید",
    },
  ],
};
