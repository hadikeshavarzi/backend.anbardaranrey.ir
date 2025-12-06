// src/lib/inventory/InventoryValidator.ts

import { Payload } from "payload";
import { InventoryItem, InventoryValidationResult } from "./types";
import { NegativeQuantityError, InsufficientStockError } from "../errors/InventoryErrors";
import { logger } from "../utils/logger";

export class InventoryValidator {
  static validateItem(item: InventoryItem): void {
    if (item.qty < 0) {
      throw new NegativeQuantityError(item.qty);
    }

    if (item.weight < 0) {
      throw new NegativeQuantityError(item.weight);
    }

    if (item.qty === 0 && item.weight === 0) {
      logger.warn("آیتم با تعداد و وزن صفر", { item });
    }
  }

  static async validateOutboundStock(
    payload: Payload,
    product: string,
    owner: string,
    requiredQty: number,
    requiredWeight: number
  ): Promise<void> {
    const stock = await payload.find({
      collection: "inventorystock",
      where: {
        and: [
          { product: { equals: product } },
          { owner: { equals: owner } },
        ],
      },
      limit: 1,
    });

    const existing = stock.docs[0];
    const availableQty = existing ? Number(existing.qtyOnHand || 0) : 0;
    const availableWeight = existing ? Number(existing.weightOnHand || 0) : 0;

    if (requiredQty > availableQty) {
      throw new InsufficientStockError(
        product,
        requiredQty,
        availableQty
      );
    }

    if (requiredWeight > availableWeight) {
      throw new InsufficientStockError(
        product,
        requiredWeight,
        availableWeight
      );
    }
  }

  // src/lib/inventory/InventoryValidator.ts
// فقط تابع validateReceipt رو تغییر بده:

static async validateReceipt(
  payload: Payload,
  doc: { items?: Array<string | { id: string }> },
  isOutbound: boolean
): Promise<InventoryValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!doc.items || doc.items.length === 0) {
    errors.push("رسید باید حداقل یک آیتم داشته باشد");
    return { valid: false, errors, warnings };
  }

  const itemIDs: string[] = doc.items.map((it: string | { id: string }) =>
    typeof it === "object" ? it.id : it
  );

  const items = await payload.find({
    collection: "receiptitems",
    where: { id: { in: itemIDs } },
    limit: 500,
  });

 // src/lib/inventory/InventoryValidator.ts
// فقط قسمت catch رو تغییر بده:

for (const item of items.docs) {
  try {
    const productRaw = typeof item.product === "object" ? (item.product as { id: number }).id : item.product;
    const ownerRaw = typeof item.owner === "object" ? (item.owner as { id: number }).id : item.owner;
    
    const product = String(productRaw);
    const owner = String(ownerRaw);
    const qty = Number((item as { count?: number }).count || 0);
    const weight = Number((item as { weights_net_weight?: number }).weights_net_weight || 0);

    InventoryValidator.validateItem({ product, owner, qty, weight });

    if (isOutbound) {
      await InventoryValidator.validateOutboundStock(
        payload,
        product,
        owner,
        qty,
        weight
      );
    }
  } catch (error) {
    const itemId = String((item as { id: number }).id);  // ✅ تبدیل به string
    errors.push(`آیتم ${itemId}: ${(error as Error).message}`);
  }
}

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
}