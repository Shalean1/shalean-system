"use client";

import { useState, useEffect } from "react";
import { PaymentMethod } from "@/lib/storage/payment-methods-supabase";
import PaymentMethods from "./PaymentMethods";

interface PaymentMethodsWrapperProps {
  initialPaymentMethods: PaymentMethod[];
}

export default function PaymentMethodsWrapper({ initialPaymentMethods }: PaymentMethodsWrapperProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/payment-methods");
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error("Error refreshing payment methods:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <PaymentMethods 
      paymentMethods={paymentMethods} 
      onRefresh={handleRefresh}
    />
  );
}









