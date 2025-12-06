export class InventoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "InventoryError";
  }
}

export class InsufficientStockError extends InventoryError {
  constructor(product: string, required: number, available: number) {
    super(
      `موجودی کافی نیست. نیاز: ${required}, موجود: ${available}`,
      "INSUFFICIENT_STOCK",
      { product, required, available }
    );
  }
}

export class NegativeQuantityError extends InventoryError {
  constructor(qty: number) {
    super(
      `تعداد نمی‌تواند منفی باشد: ${qty}`,
      "NEGATIVE_QUANTITY",
      { qty }
    );
  }
}

export class DuplicateFinalizationError extends InventoryError {
  constructor(receiptNo: number) {
    super(
      `رسید ${receiptNo} قبلاً نهایی شده است`,
      "DUPLICATE_FINALIZATION",
      { receiptNo }
    );
  }
}

export class ConcurrencyError extends InventoryError {
  constructor() {
    super(
      "تداخل در به‌روزرسانی موجودی. لطفاً دوباره تلاش کنید",
      "CONCURRENCY_ERROR"
    );
  }
}
