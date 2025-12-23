"use client";

import { useEffect, useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { getCreditTransactionsAction } from "@/app/actions/credits";
import { CreditTransaction } from "@/lib/storage/credits-supabase";

interface TransactionHistoryProps {
  limit?: number;
}

export default function TransactionHistory({ limit = 50 }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "purchase" | "usage">("all");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const result = await getCreditTransactionsAction();
      if (result.success && result.transactions) {
        setTransactions(result.transactions);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "purchase") return t.transactionType === "purchase";
    if (filter === "usage") return t.transactionType === "usage";
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("purchase")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "purchase"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Purchases
        </button>
        <button
          onClick={() => setFilter("usage")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "usage"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Usage
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {transaction.transactionType === "purchase" ? (
                  <ArrowUpCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowDownCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.transactionType === "purchase"
                      ? "Credit Purchase"
                      : "Credit Usage"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </p>
                  {transaction.paymentMethod && (
                    <p className="text-xs text-gray-400 mt-1">
                      {transaction.paymentMethod === "card" ? "Card Payment" : "EFT Deposit"}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold ${
                    transaction.transactionType === "purchase"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.transactionType === "purchase" ? "+" : "-"}R
                  {transaction.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Balance: R{transaction.balanceAfter.toFixed(2)}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  {getStatusIcon(transaction.status)}
                  <span className="text-xs text-gray-500 capitalize">
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}












