// src/jobs/inventoryReconciliation.ts

import { Payload } from "payload";
import { logger } from "../lib/utils/logger";

/**
 * Job برای تطبیق موجودی با تراکنش‌ها
 * اجرا: هر شب یا هر هفته
 */
export async function reconcileInventory(payload: Payload) {
  logger.info("🔄 شروع تطبیق موجودی...");

  try {
    const stocks = await payload.find({
      collection: "inventorystock",
      limit: 10000,
    });

    let discrepancies = 0;

    for (const stock of stocks.docs) {
      // محاسبه موجودی از روی تراکنش‌ها
      const transactions = await payload.find({
        collection: "inventorytransactions",
        where: {
          and: [
            { product: { equals: stock.product } },
            { owner: { equals: stock.owner } },
          ],
        },
        limit: 10000,
      });

      let calculatedQty = 0;
      let calculatedWeight = 0;

      for (const tx of transactions.docs) {
        const qty = Number(tx.qty || 0);
        const weight = Number(tx.weight || 0);

        if (tx.type === "in") {
          calculatedQty += qty;
          calculatedWeight += weight;
        } else if (tx.type === "out") {
          calculatedQty -= qty;
          calculatedWeight -= weight;
        }
      }

      // مقایسه با موجودی ثبت شده
      const recordedQty = Number(stock.qtyOnHand || 0);
      const recordedWeight = Number(stock.weightOnHand || 0);

      if (
        Math.abs(calculatedQty - recordedQty) > 0.001 ||
        Math.abs(calculatedWeight - recordedWeight) > 0.001
      ) {
        discrepancies++;

        logger.warn("⚠️ اختلاف موجودی یافت شد", {
          stockId: stock.id,
          product: stock.product,
          owner: stock.owner,
          recorded: { qty: recordedQty, weight: recordedWeight },
          calculated: { qty: calculatedQty, weight: calculatedWeight },
        });

        // TODO: اصلاح خودکار یا ارسال نوتیفیکیشن
      }
    }

    logger.info(
      `✅ تطبیق موجودی تمام شد. اختلاف‌ها: ${discrepancies}`,
      {
        totalStocks: stocks.totalDocs,
        discrepancies,
      }
    );
  } catch (error: any) {
    logger.error("❌ خطا در تطبیق موجودی", error);
  }
}