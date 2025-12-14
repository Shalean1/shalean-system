"use client";

import { useState, useMemo, useEffect } from "react";
import { Payment } from "@/lib/storage/payments-supabase";
import PaymentList from "./PaymentList";
import PaymentFilterBar, { SortOption, PaymentStatusFilter } from "./PaymentFilterBar";
import PaymentMethodsWrapper from "./PaymentMethodsWrapper";
import { PaymentMethod } from "@/lib/storage/payment-methods-supabase";
import Pagination from "./Pagination";

interface PaymentsSectionProps {
  payments: Payment[];
  paymentMethods: PaymentMethod[];
}

const ITEMS_PER_PAGE = 10;

export default function PaymentsSection({ payments, paymentMethods }: PaymentsSectionProps) {
  const [filter, setFilter] = useState<PaymentStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

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

  // Paginate sorted payments
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedPayments.slice(startIndex, endIndex);
  }, [sortedPayments, currentPage]);

  const totalPages = Math.ceil(sortedPayments.length / ITEMS_PER_PAGE);

  const statusCounts = {
    all: payments.length,
    pending: payments.filter((p) => p.paymentStatus === "pending").length,
    completed: payments.filter((p) => p.paymentStatus === "completed").length,
  };

  return (
    <>
      {/* Filter Bar - Full Width */}
      <div className="mb-6">
        <PaymentFilterBar
          filter={filter}
          setFilter={setFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          statusCounts={statusCounts}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <PaymentMethodsWrapper initialPaymentMethods={paymentMethods} />
          </div>
        </div>

        {/* Payments List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <PaymentList payments={paginatedPayments} allPaymentsCount={payments.length} />
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={sortedPayments.length}
            />
          </div>
        </div>
      </div>
    </>
  );
}
