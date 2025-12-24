"use client";

import { Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserCreditBalanceAction } from "@/app/actions/credits";

interface CreditBalanceProps {
  initialBalance?: number;
  showLabel?: boolean;
}

export default function CreditBalance({
  initialBalance,
  showLabel = true,
}: CreditBalanceProps) {
  const [balance, setBalance] = useState<number>(initialBalance ?? 0);
  const [loading, setLoading] = useState(!initialBalance);

  useEffect(() => {
    if (!initialBalance) {
      loadBalance();
    }
  }, [initialBalance]);

  const loadBalance = async () => {
    setLoading(true);
    try {
      const result = await getUserCreditBalanceAction();
      if (result.success && result.balance !== undefined) {
        setBalance(result.balance);
      }
    } catch (error) {
      console.error("Error loading credit balance:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-200">
        <Coins className="w-5 h-5" />
      </div>
      <div>
        {showLabel && (
          <p className="text-xs font-medium text-gray-600 mb-1">ShalCred Balance</p>
        )}
        {loading ? (
          <p className="text-2xl font-bold text-gray-400">Loading...</p>
        ) : (
          <p className="text-2xl font-bold text-yellow-700">
            R{balance.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}
















