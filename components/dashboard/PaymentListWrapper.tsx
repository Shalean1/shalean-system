"use client";

import { useState, useMemo } from "react";
import { Payment } from "@/lib/storage/payments-supabase";
import PaymentList from "./PaymentList";
import PaymentFilterBar, { SortOption, PaymentStatusFilter } from "./PaymentFilterBar";

interface PaymentListWrapperProps {
  payments: Payment[];
  renderFilterBar?: boolean;
  renderList?: boolean;
}

export default function PaymentListWrapper({ 
  payments, 
  renderFilterBar = true,
  renderList = true 
}: PaymentListWrapperProps) {
  const [filter, setFilter] = useState<PaymentStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  // Filter and search payments
  const filteredAndSearchedPayments = useMemo(() => {
    let result = payments;

    // Apply status filter
    if (filter !== "all") {
      result = result.filter((payment) => payment.paymentStatus === filter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((payment) => {
        const serviceType = payment.booking.service
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        const reference = payment.bookingReference.toLowerCase();
        
        return (
          serviceType.toLowerCase().includes(query) ||
          reference.includes(query) ||
          payment.paymentReference?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [payments, filter, searchQuery]);

  // Sort payments
  const sortedPayments = useMemo(() => {
    const result = [...filteredAndSearchedPayments];

    switch (sortBy) {
      case "date-desc":
        return result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      
      case "date-asc":
        return result.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      
      case "amount-desc":
        return result.sort((a, b) => b.amount - a.amount);
      
      case "amount-asc":
        return result.sort((a, b) => a.amount - b.amount);
      
      case "status":
        const statusOrder: { [key: string]: number } = { completed: 0, pending: 1, failed: 2 };
        return result.sort((a, b) => {
          const aOrder = statusOrder[a.paymentStatus] ?? 99;
          const bOrder = statusOrder[b.paymentStatus] ?? 99;
          return aOrder - bOrder;
        });
      
      default:
        return result;
    }
  }, [filteredAndSearchedPayments, sortBy]);

  const statusCounts = {
    all: payments.length,
    pending: payments.filter((p) => p.paymentStatus === "pending").length,
    completed: payments.filter((p) => p.paymentStatus === "completed").length,
  };

  return (
    <>
      {renderFilterBar && (
        <PaymentFilterBar
          filter={filter}
          setFilter={setFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          statusCounts={statusCounts}
        />
      )}
      {renderList && (
        <PaymentList payments={sortedPayments} allPaymentsCount={payments.length} />
      )}
    </>
  );
}
