// src/lib/inventory/types.ts

export interface InventoryItem {
  product: string | number;
  owner: string | number;
  qty: number;
  weight: number;
}

export interface InventorySnapshot {
  qtyBefore: number;
  weightBefore: number;
  qtyAfter: number;
  weightAfter: number;
}

export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  stockId?: string;
  error?: Error;
  snapshot: InventorySnapshot;
}

export interface InventoryValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export enum ReceiptStatus {
  DRAFT = "draft",
  FINAL = "final",
  CANCELLED = "cancelled",
  REVERSED = "reversed"
}

export enum TransactionType {
  IN = "in",
  OUT = "out",
  ADJUSTMENT = "adjustment",
  REVERSAL = "reversal"
}