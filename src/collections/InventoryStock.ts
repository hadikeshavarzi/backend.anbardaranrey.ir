import type { CollectionConfig } from "payload";

export const InventoryStock: CollectionConfig = {
  slug: "inventorystock",

  admin: {
    group: "انبار",
    useAsTitle: "product",
    defaultColumns: [
      "product",
      "owner",
      "qtyOnHand",
      "weightOnHand",
      "qtyIn",
      "qtyOut",
    ],
  },

  access: {
    read: () => true,
    create: () => true, // در عمل، فقط هوک‌ها می‌سازن
    update: () => true,
    delete: () => true,
  },

  fields: [
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
      relationTo: "customers", // طرف حساب / مالک کالا
      required: true,
      label: "طرف حساب",
    },

    // ورودی/خروجی تجمیعی
    { name: "qtyIn", type: "number", defaultValue: 0, label: "جمع تعداد ورودی" },
    { name: "qtyOut", type: "number", defaultValue: 0, label: "جمع تعداد خروجی" },
    { name: "weightIn", type: "number", defaultValue: 0, label: "جمع وزن ورودی" },
    { name: "weightOut", type: "number", defaultValue: 0, label: "جمع وزن خروجی" },

    // موجودی لحظه‌ای
    { name: "qtyOnHand", type: "number", defaultValue: 0, label: "موجودی تعداد" },
    { name: "weightOnHand", type: "number", defaultValue: 0, label: "موجودی وزن" },
  ],

  indexes: [
    {
      fields: ["product", "owner"],
      unique: true, // هر کالا-مالک فقط یک رکورد
    },
  ],
};
