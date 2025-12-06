// src/collections/ReceiptItems.ts

import type { CollectionConfig } from "payload";
import { authenticateMember } from "../lib/authMembers";

export const ReceiptItems: CollectionConfig = {
  slug: "receiptitems",

  admin: {
    group: "رسیدها",
    useAsTitle: "product_description",
    defaultColumns: [
      "product",
      "row",
      "is_parent",
      "count",
      "weights_net_weight",
    ],
  },

  access: {
    read: ({ req }) => !!authenticateMember(req) || !!req.user,
    create: ({ req }) => !!authenticateMember(req) || !!req.user,
    update: ({ req }) => !!authenticateMember(req) || !!req.user,
    delete: ({ req }) => !!authenticateMember(req) || !!req.user,
  },

  fields: [
    // --- کالا ---
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      label: "کالای انتخاب‌شده",
      required: true,
    },

    // --- مشتری ---
    {
      name: "owner",
      type: "relationship",
      relationTo: "customers",
      label: "مالک کالا",
      required: true,
    },

    // --- Parent / Child ---
    {
      name: "is_parent",
      type: "checkbox",
      label: "آیا ردیف والد است؟",
      defaultValue: false,
    },

    {
      name: "parent",
      type: "relationship",
      relationTo: "receiptitems",
      label: "والد",
      required: false,
      admin: { condition: (data) => !data?.is_parent },
    },

    {
      name: "parent_row",
      type: "text",
      label: "ردیف والد",
      admin: { readOnly: true, condition: (data) => !data?.is_parent },
    },

    // --- Row ---
    {
      name: "row",
      type: "text",
      label: "شماره ردیف / Parent Code",
      admin: { condition: (data) => data?.is_parent === true },
    },

    // --- سایر فیلدها ---
    { name: "national_product_id", type: "text", label: "شناسه ملی" },
    { name: "product_description", type: "text", label: "شرح کالا" },
    { name: "count", type: "number", label: "تعداد", defaultValue: 0 },

    {
      name: "production_type",
      type: "select",
      required: false,
      options: [
        { label: "داخلی", value: "domestic" },
        { label: "وارداتی", value: "import" },
      ],
    },

    { name: "is_used", type: "checkbox", defaultValue: false, label: "مستعمل" },
    { name: "is_defective", type: "checkbox", defaultValue: false, label: "معیوب" },

    // --- وزن‌ها ---
    { name: "weights_full_weight", type: "number", defaultValue: 0 },
    { name: "weights_empty_weight", type: "number", defaultValue: 0 },
    { name: "weights_net_weight", type: "number", defaultValue: 0 },
    { name: "weights_origin_weight", type: "number", defaultValue: 0 },
    { name: "weights_weight_diff", type: "number", defaultValue: 0 },

    // --- ابعاد ---
    { name: "dimensions_length", type: "number", defaultValue: 0 },
    { name: "dimensions_width", type: "number", defaultValue: 0 },
    { name: "dimensions_thickness", type: "number", defaultValue: 0 },

    // --- متفرقه ---
    { name: "heat_number", type: "text" },
    { name: "bundle_no", type: "text" },
    { name: "brand", type: "text" },
    { name: "order_no", type: "text" },
    { name: "depo_location", type: "text" },
    { name: "description_notes", type: "textarea" },
  ],

  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation !== "create") return data;

        const payload = req.payload;

        // ------------ CHILD ------------
        if (!data.is_parent && data.parent) {
          const parentItem = await payload.findByID({
            collection: "receiptitems",
            id: data.parent,
          });

          data.parent_row = parentItem.row;
          data.row = parentItem.row;
          return data;
        }

        // ------------ PARENT ------------
        if (data.is_parent) {
          const lastParent = await payload.find({
            collection: "receiptitems",
            where: {
              and: [
                { owner: { equals: data.owner } },
                { product: { equals: data.product } },
                { is_parent: { equals: true } },
              ],
            },
            sort: "-id",
            limit: 1,
          });

          let next = 1;

          if (lastParent.docs.length > 0) {
            const lastRow = String(lastParent.docs[0].row || "");
            const lastNum = parseInt(lastRow.replace(/\D/g, "") || "0", 10);
            next = lastNum + 1;
          }

          data.row = next.toString().padStart(4, "0");
          data.parent_row = data.row;

          return data;
        }

        return data;
      },
    ],
  },
};