/**
 * Credit transaction type matching the database schema
 */
export interface CreditTransaction {
  id: string;
  userId: string;
  transactionType: "purchase" | "usage" | "refund";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  paymentMethod?: "card" | "eft";
  paymentReference?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Map database record to CreditTransaction type
 */
export function mapDatabaseToCreditTransaction(data: any): CreditTransaction {
  return {
    id: data.id,
    userId: data.user_id,
    transactionType: data.transaction_type,
    amount: parseFloat(data.amount),
    balanceBefore: parseFloat(data.balance_before),
    balanceAfter: parseFloat(data.balance_after),
    paymentMethod: data.payment_method || undefined,
    paymentReference: data.payment_reference || undefined,
    status: data.status,
    metadata: data.metadata || {},
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}












