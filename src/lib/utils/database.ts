// src/lib/utils/database.ts

import { Payload } from "payload";

export class DatabaseTransaction {
  /**
   * اجرای عملیات در یک Transaction
   * با قابلیت Retry در صورت Deadlock
   */
  static async executeWithRetry<T>(
    payload: Payload,
    operation: (trx: any) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // دسترسی به Drizzle instance
        const db = payload.db;
        
        const drizzle = db.drizzle;
        
        if (!drizzle || typeof drizzle.transaction !== 'function') {
          // اگر transaction در دسترس نبود، بدون transaction اجرا کن
          console.warn('Transaction not available, executing without transaction');
          return await operation(drizzle || db);
        }

        const result = await drizzle.transaction(
          async (trx: any) => {
            return await operation(trx);
          }
        );

        return result;
      } catch (error: any) {
        lastError = error;

        const isRetryable =
          error.code === "40P01" ||
          error.code === "55P03" ||
          error.message?.includes("could not serialize");

        if (isRetryable && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 100;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Lock کردن سطر برای Update (Pessimistic Locking)
   */
  static async lockStockForUpdate(
    trx: any,
    product: string,
    owner: string
  ): Promise<any> {
    try {
      // اگر trx یک Drizzle transaction هست
      if (trx && typeof trx === 'function') {
        // Use raw SQL for SELECT FOR UPDATE
        const result = await trx.execute(
          `SELECT * FROM inventorystock WHERE product_id = $1 AND owner_id = $2 FOR UPDATE`,
          [product, owner]
        );
        return result.rows?.[0] || null;
      }
      
      // Fallback: اگر Knex یا compatible باشه
      if (trx && typeof trx === 'object') {
        const result = await trx("inventorystock")
          .where({ product_id: product, owner_id: owner })
          .forUpdate()
          .first();
        return result;
      }

      return null;
    } catch (error) {
      console.error('Lock error:', error);
      throw error;
    }
  }
}