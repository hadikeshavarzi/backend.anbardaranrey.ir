import type { CollectionConfig } from "payload";
import { authenticateMember } from "../lib/authMembers";

export const Customers: CollectionConfig = {
  slug: "customers",

  admin: {
    useAsTitle: "name",
    group: "اطلاعات پایه",
    defaultColumns: [
      "customer_type",
      "name",
      "mobile",
      "national_id",
      "economic_code",
    ],
  },

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

  fields: [
    {
      name: "customer_type",
      type: "select",
      label: "نوع مشتری",
      required: true,
      options: [
        { label: "حقیقی", value: "person" },
        { label: "حقوقی", value: "company" },
      ],
      defaultValue: "person",
    },

    {
      name: "name",
      type: "text",
      label: "نام / نام شرکت",
      required: true,
    },

    {
      name: "national_id",
      type: "text",
      label: "کد ملی / شناسه ملی",
    },

    {
      name: "mobile",
      type: "text",
      label: "موبایل",
    },

    {
      name: "phone",
      type: "text",
      label: "تلفن ثابت",
    },

    {
      name: "economic_code",
      type: "text",
      label: "کد اقتصادی",
    },

    {
      name: "postal_code",
      type: "text",
      label: "کد پستی",
    },

    {
      name: "birth_or_register_date",
      type: "date",
      label: "تاریخ تولد / تاریخ ثبت شرکت",
    },

    {
      name: "address",
      type: "textarea",
      label: "آدرس",
    },

    {
      name: "description",
      type: "textarea",
      label: "توضیحات",
    },
  ],
};
