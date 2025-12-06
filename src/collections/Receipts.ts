// src/collections/Receipts.ts

import type { CollectionConfig } from "payload";
import { authenticateMember } from "../lib/authMembers";
import { InventoryEngine } from "../lib/inventory/InventoryEngine";
import { InventoryValidator } from "../lib/inventory/InventoryValidator";
import { TransactionType, ReceiptStatus } from "../lib/inventory/types";
import { logger } from "../lib/utils/logger";
import {
  InventoryError,
} from "../lib/errors/InventoryErrors";

export const Receipts: CollectionConfig = {
  slug: "receipts",

  admin: {
    useAsTitle: "receiptNo",
    group: "رسیدها",
    defaultColumns: ["receiptNo", "docType", "member", "docDate", "status"],
  },

  /* ========================
        ACCESS CONTROL
  =========================*/
  access: {
    read: ({ req }) => !!authenticateMember(req) || !!req.user,
    create: ({ req }) => !!authenticateMember(req) || !!req.user,
    update: ({ req }) => !!authenticateMember(req) || !!req.user,
    delete: () => {
      return {
        status: { equals: ReceiptStatus.DRAFT },
      };
    },
  },

  /* ========================
            HOOKS
  =========================*/
  hooks: {
    /* ========================
        BEFORE VALIDATE
    =========================*/
    beforeValidate: [
      async ({ req, data, operation }) => {
        if (operation === "create" && data) {
          const last = await req.payload.find({
            collection: "receipts",
            limit: 1,
            sort: "-receiptNo",
          });

          const lastNo = last.docs?.[0]?.receiptNo ?? 0;
          data.receiptNo = Number(lastNo) + 1;

          logger.info(`رسید جدید با شماره ${data.receiptNo} در حال ایجاد`);
        }

        return data;
      },
    ],

    /* ========================
        BEFORE CHANGE
    =========================*/
    beforeChange: [
      async ({ req, data, operation, originalDoc }) => {
        const payload = req.payload;

        if (operation === "create") {
          const docType = await payload.find({
            collection: "document_types",
            where: { code: { equals: 1 } },
            limit: 1,
          });

          if (docType.docs.length > 0) {
            data.docType = docType.docs[0].id;
          }

          const token = authenticateMember(req);
          if (token) data.member = token.id;

          data.status = data.status || ReceiptStatus.DRAFT;
        }

        if (operation === "update" && originalDoc) {
          if (
              originalDoc.status === ReceiptStatus.FINAL &&
              data.status !== ReceiptStatus.CANCELLED
          ) {
            throw new Error(
                "رسید نهایی شده قابل ویرایش نیست. برای اصلاح، ابتدا آن را لغو کنید."
            );
          }
        }

        return data;
      },
    ],

    /* ========================
        AFTER CHANGE
    =========================*/
    afterChange: [
      async ({ req, doc, previousDoc }) => {
        const payload = req.payload;
        const userId = req.user?.id ? String(req.user.id) : undefined;

        try {
          // ===== FINALIZATION (draft → final) =====
          if (
              previousDoc &&
              doc.status === ReceiptStatus.FINAL &&
              previousDoc.status === ReceiptStatus.DRAFT
          ) {
            logger.receipt(doc.id, `شروع نهایی‌سازی رسید ${doc.receiptNo}`);

            // 1️⃣ تشخیص نوع سند
            const docTypeId =
                typeof doc.docType === "object" ? doc.docType.id : doc.docType;

            const docType = await payload.findByID({
              collection: "document_types",
              id: docTypeId,
            });

            const transactionType =
                docType.code === 1 ? TransactionType.IN : TransactionType.OUT;

            // 2️⃣ اعتبارسنجی جامع
            const validation = await InventoryValidator.validateReceipt(
                payload,
                doc,
                transactionType === TransactionType.OUT
            );

            if (!validation.valid) {
              throw new InventoryError(
                  `خطاهای اعتبارسنجی: ${validation.errors.join(", ")}`,
                  "VALIDATION_ERROR",
                  validation
              );
            }

            if (validation.warnings.length > 0) {
              logger.warn(`هشدارها برای رسید ${doc.receiptNo}`, {
                warnings: validation.warnings,
              });
            }

            // 3️⃣ آماده‌سازی آیتم‌ها
            const itemIDs: string[] = (doc.items || []).map((it: string | { id: string }) =>
                typeof it === "object" ? it.id : it
            );

            const items = await payload.find({
              collection: "receiptitems",
              where: { id: { in: itemIDs } },
              limit: 500,
            });

            const inventoryItems = items.docs.map((item) => {
              const product = typeof item.product === "object" ? item.product.id : item.product;
              const owner = typeof item.owner === "object" ? item.owner.id : item.owner;

              return {
                product: String(product),
                owner: String(owner),
                qty: Number(item.count || 0),
                weight: Number(item.weights_net_weight || 0),
              };
            });

            // 4️⃣ پردازش موجودی
            const result = await InventoryEngine.processReceipt(
                payload,
                doc.id,
                inventoryItems,
                transactionType,
                userId
            );

            if (!result.success) {
              logger.error(`خطا در پردازش رسید ${doc.receiptNo}`, undefined, {
                errors: result.errors,
              });

              await payload.update({
                collection: "receipts",
                id: doc.id,
                data: { status: ReceiptStatus.DRAFT },
              });

              throw new InventoryError(
                  `پردازش ناموفق: ${result.failed} از ${
                      result.processed + result.failed
                  } آیتم`,
                  "PROCESSING_FAILED",
                  result.errors
              );
            }

            logger.receipt(
                doc.id,
                `✅ رسید ${doc.receiptNo} با موفقیت نهایی شد`,
                {
                  processed: result.processed,
                  transactionType,
                }
            );
          }

          // ===== CANCELLATION (final → cancelled) =====
          if (
              previousDoc &&
              doc.status === ReceiptStatus.CANCELLED &&
              previousDoc.status === ReceiptStatus.FINAL
          ) {
            logger.receipt(doc.id, `شروع لغو رسید ${doc.receiptNo}`);

            await InventoryEngine.reverseReceipt(payload, doc.id, userId);

            logger.receipt(doc.id, `✅ رسید ${doc.receiptNo} لغو شد`);
          }
        } catch (error) {
          logger.error(`خطای critical در پردازش رسید ${doc.receiptNo}`, error as Error, {
            receiptId: doc.id,
          });

          throw error;
        }
      },
    ],
  },

  /* ========================
            FIELDS
  =========================*/
  fields: [
    {
      name: "docType",
      type: "relationship",
      relationTo: "document_types",
      admin: { readOnly: true, position: "sidebar" },
      required: true,
    },

    {
      name: "receiptNo",
      type: "number",
      admin: { readOnly: true },
    },

    {
      name: "member",
      type: "relationship",
      relationTo: "members",
      admin: { readOnly: true, position: "sidebar" },
      required: true,
    },

    {
      name: "status",
      type: "select",
      defaultValue: ReceiptStatus.DRAFT,
      required: true,
      options: [
        { label: "پیش‌نویس", value: ReceiptStatus.DRAFT },
        { label: "ثبت شده", value: ReceiptStatus.FINAL },
        { label: "لغو شده", value: ReceiptStatus.CANCELLED },
      ],
      admin: {
        description:
            "⚠️ تغییر از 'ثبت شده' به 'لغو شده' موجودی را برمی‌گرداند",
      },
    },

    { name: "docDate", type: "date", required: true },

    {
      name: "refDocument",
      type: "group",
      fields: [
        {
          name: "refType",
          type: "select",
          defaultValue: "none",
          required: true,
          options: [
            { label: "بدون مرجع", value: "none" },
            { label: "بارنامه", value: "barnameh" },
            { label: "پته", value: "petteh" },
            { label: "حواله سامانه جامع", value: "havale" },
            { label: "اظهار تولید", value: "production" },
          ],
        },
        { name: "barnamehNumber", type: "text" },
        { name: "barnamehDate", type: "date" },
        { name: "barnamehTracking", type: "text" },
        { name: "pettehNumber", type: "text" },
        { name: "havaleNumber", type: "text" },
        { name: "productionNumber", type: "text" },
      ],
    },

    {
      name: "owner",
      type: "relationship",
      relationTo: "customers",
      required: true,
    },
    { name: "deliverer", type: "relationship", relationTo: "customers" },

    {
      name: "driver",
      type: "group",
      fields: [
        { name: "name", type: "text" },
        { name: "nationalId", type: "text" },
        { name: "birthDate", type: "date" },
      ],
    },

    {
      name: "plate",
      type: "group",
      fields: [
        { name: "iranRight", type: "text" },
        { name: "mid3", type: "text" },
        { name: "letter", type: "text" },
        { name: "left2", type: "text" },
      ],
    },

    {
      name: "finance",
      type: "group",
      fields: [
        { name: "loadCost", type: "number", defaultValue: 0 },
        { name: "unloadCost", type: "number", defaultValue: 0 },
        { name: "warehouseCost", type: "number", defaultValue: 0 },
        { name: "tax", type: "number", defaultValue: 0 },
        { name: "returnFreight", type: "number", defaultValue: 0 },
        { name: "loadingFee", type: "number", defaultValue: 0 },
        { name: "miscCost", type: "number", defaultValue: 0 },
        { name: "miscDescription", type: "textarea" },
      ],
    },

    {
      name: "payment",
      type: "group",
      fields: [
        {
          name: "paymentBy",
          type: "select",
          options: [
            { label: "مشتری", value: "customer" },
            { label: "انبار", value: "warehouse" },
          ],
        },
        { name: "cardNumber", type: "text" },
        { name: "accountNumber", type: "text" },
        { name: "bankName", type: "text" },
        { name: "ownerName", type: "text" },
        { name: "trackingCode", type: "text" },
      ],
    },

    {
      name: "items",
      type: "relationship",
      relationTo: "receiptitems",
      hasMany: true,
      required: true,
      validate: (value) => {
        if (!value || value.length === 0) {
          return "حداقل یک آیتم الزامی است";
        }
        return true;
      },
    },
  ],
};