// src/lib/inventory/InventoryEngine.ts

import { Payload } from "payload";
import { InventoryItem, TransactionResult, TransactionType } from "./types";
import { InventoryValidator } from "./InventoryValidator";
import { DatabaseTransaction } from "../utils/database";
import { logger } from "../utils/logger";

export class InventoryEngine {
  static async processItem(
    payload: Payload,
    item: InventoryItem,
    transactionType: TransactionType,
    refReceiptId: string,
    _userId?: string
  ): Promise<TransactionResult> {
    InventoryValidator.validateItem(item);

    try {
      const result = await DatabaseTransaction.executeWithRetry(
        payload,
        async (_trx) => {
          // 1️⃣ خواندن موجودی فعلی
          const stockRes = await payload.find({
            collection: "inventorystock",
            where: {
              and: [
                { product: { equals: typeof item.product === 'string' ? parseInt(item.product) : item.product } },
                { owner: { equals: typeof item.owner === 'string' ? parseInt(item.owner) : item.owner } },
              ],
            },
            limit: 1,
          });

          const lockedStock = stockRes.docs[0];
          const qtyBefore = lockedStock ? Number(lockedStock.qtyOnHand || 0) : 0;
          const weightBefore = lockedStock ? Number(lockedStock.weightOnHand || 0) : 0;

          const isIN = transactionType === TransactionType.IN;
          const isOUT = transactionType === TransactionType.OUT;

          let qtyAfter = qtyBefore;
          let weightAfter = weightBefore;

          if (isIN) {
            qtyAfter = qtyBefore + item.qty;
            weightAfter = weightBefore + item.weight;
          } else if (isOUT) {
            qtyAfter = qtyBefore - item.qty;
            weightAfter = weightBefore - item.weight;

            if (qtyAfter < 0 || weightAfter < 0) {
              throw new Error(
                `موجودی منفی: qty=${qtyAfter}, weight=${weightAfter}`
              );
            }
          }

        // 2️⃣ ثبت تراکنش
        const transaction = await payload.create({
  collection: "inventorytransactions",
  data: {
    product: typeof item.product === 'string' ? parseInt(item.product) : item.product,
    owner: typeof item.owner === 'string' ? parseInt(item.owner) : item.owner,
    type: transactionType as "in" | "out", 
    qty: item.qty,
    weight: item.weight,
    snapshot_qty_before: qtyBefore,
    snapshot_qty_after: qtyAfter,
    ref_receipt: parseInt(refReceiptId),
  },
});

          // 3️⃣ آپدیت یا ایجاد موجودی
          let stockId: string;

          if (lockedStock) {
            await payload.update({
              collection: "inventorystock",
              id: lockedStock.id,
              data: {
                qtyIn: isIN
                  ? Number(lockedStock.qtyIn || 0) + item.qty
                  : lockedStock.qtyIn,
                qtyOut: isOUT
                  ? Number(lockedStock.qtyOut || 0) + item.qty
                  : lockedStock.qtyOut,
                weightIn: isIN
                  ? Number(lockedStock.weightIn || 0) + item.weight
                  : lockedStock.weightIn,
                weightOut: isOUT
                  ? Number(lockedStock.weightOut || 0) + item.weight
                  : lockedStock.weightOut,
                qtyOnHand: qtyAfter,
                weightOnHand: weightAfter,
              },
            });

            stockId = String(lockedStock.id);
          } else {
            const newStock = await payload.create({
              collection: "inventorystock",
              data: {
                product: typeof item.product === 'string' ? parseInt(item.product) : item.product,
                owner: typeof item.owner === 'string' ? parseInt(item.owner) : item.owner,
                qtyIn: isIN ? item.qty : 0,
                qtyOut: isOUT ? item.qty : 0,
                weightIn: isIN ? item.weight : 0,
                weightOut: isOUT ? item.weight : 0,
                qtyOnHand: qtyAfter,
                weightOnHand: weightAfter,
              },
            });

            stockId = String(newStock.id);
          }

          return {
            success: true,
            transactionId: String(transaction.id),
            stockId,
            snapshot: {
              qtyBefore,
              weightBefore,
              qtyAfter,
              weightAfter,
            },
          };
        }
      );

      logger.info(`موجودی با موفقیت آپدیت شد`, {
        product: item.product,
        owner: item.owner,
        type: transactionType,
        snapshot: result.snapshot,
      });

      return result;
    } catch (error) {
      logger.error(`خطا در پردازش موجودی`, error as Error, {
        item,
        transactionType,
      });

      return {
        success: false,
        error: error as Error,
        snapshot: {
          qtyBefore: 0,
          weightBefore: 0,
          qtyAfter: 0,
          weightAfter: 0,
        },
      };
    }
  }

  static async processReceipt(
    payload: Payload,
    receiptId: string,
    items: InventoryItem[],
    transactionType: TransactionType,
    userId?: string
  ): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    errors: Array<{ item: InventoryItem; error: Error }>;
  }> {
    const results = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [] as Array<{ item: InventoryItem; error: Error }>,
    };

    for (const item of items) {
      const result = await InventoryEngine.processItem(
        payload,
        item,
        transactionType,
        receiptId,
        userId
      );

      if (result.success) {
        results.processed++;
      } else {
        results.failed++;
        results.success = false;
        if (result.error) {
          results.errors.push({ item, error: result.error });
        }
      }
    }

    return results;
  }

  static async reverseReceipt(
    payload: Payload,
    originalReceiptId: string,
    userId?: string
  ): Promise<void> {
    logger.info(`شروع برگشت رسید ${originalReceiptId}`);

    const transactions = await payload.find({
      collection: "inventorytransactions",
      where: {
        refReceipt: { equals: originalReceiptId },
      },
      limit: 500,
    });

    for (const tx of transactions.docs) {
      const reverseType =
        tx.type === TransactionType.IN
          ? TransactionType.OUT
          : TransactionType.IN;

      const product = typeof tx.product === "object" ? tx.product.id : tx.product;
      const owner = typeof tx.owner === "object" ? tx.owner.id : tx.owner;

      const item: InventoryItem = {
        product: String(product),
        owner: String(owner),
        qty: Number(tx.qty || 0),
        weight: Number(tx.weight || 0),
      };

      await InventoryEngine.processItem(
        payload,
        item,
        reverseType,
        originalReceiptId,
        userId
      );
    }

    logger.info(`رسید ${originalReceiptId} با موفقیت برگشت خورد`);
  }
}