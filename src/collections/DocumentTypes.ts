import type { CollectionConfig } from "payload";
import { authenticateMember } from "../lib/authMembers";

export const DocumentTypes: CollectionConfig = {
  slug: "document_types",

  admin: {
    useAsTitle: "label",
    group: "تنظیمات اسناد",
    defaultColumns: ["code", "label"],
  },   // ✔ کاما اضافه شد

  access: {
    read: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";

      if (!memberToken && !isAdminUser) return false;

      if (isAdminUser) return true;
      if (memberToken?.role === "admin") return true;

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
      if (isAdminUser || memberToken?.role === "admin") return true;

      return true;
    },

    delete: ({ req }) => {
      const memberToken = authenticateMember(req);
      const isAdminUser = req.user && req.user.collection === "users";

      if (!memberToken && !isAdminUser) return false;
      if (isAdminUser || memberToken?.role === "admin") return true;

      return false;
    },
  },

  fields: [
    {
      name: "code",
      type: "number",
      label: "کد نوع سند",
      required: true,
      unique: true,
    },
    {
      name: "label",
      type: "text",
      label: "عنوان فارسی",
      required: true,
    },
  ],
};
