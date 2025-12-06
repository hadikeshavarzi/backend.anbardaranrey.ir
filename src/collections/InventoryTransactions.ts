import type { CollectionConfig } from "payload";
import { authenticateMember } from "../lib/authMembers";

export const InventoryTransactions: CollectionConfig = {
  slug: "inventorytransactions",
  admin: {
    group: "انبار",
    useAsTitle: "id",
    defaultColumns: ["product", "owner", "type", "qty", "weight"],
  },

  access: {
    read: ({ req }) => !!authenticateMember(req) || !!req.user,
    create: ({ req }) => !!authenticateMember(req) || !!req.user,
    update: ({ req }) => !!authenticateMember(req) || !!req.user,
    delete: ({ req }) => !!authenticateMember(req) || !!req.user,
  },

  fields: [
    {
      name: "type",
      type: "select",
      label: "نوع عملیات",
      required: true,
      options: [
        { label: "ورود", value: "in" },
        { label: "خروج", value: "out" },
      ],
    },

    // 🔥 ارتباط صحیح با receipts به‌جای clearances
    {
      name: "ref_receipt",
      type: "relationship",
      relationTo: "receipts",
      label: "سند مرتبط",
    },

    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      label: "کالا",
    },

    {
      name: "owner",
      type: "relationship",
      relationTo: "customers",
      required: true,
      label: "مالک",
    },

    {
      name: "qty",
      type: "number",
      label: "تعداد",
      defaultValue: 0,
    },

    {
      name: "weight",
      type: "number",
      label: "وزن",
      defaultValue: 0,
    },

    {
      name: "snapshot_qty_before",
      type: "number",
      label: "موجودی قبل",
      admin: { readOnly: true },
    },

    {
      name: "snapshot_qty_after",
      type: "number",
      label: "موجودی بعد",
      admin: { readOnly: true },
    },
  ],
};
