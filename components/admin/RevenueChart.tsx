"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RevenueTrend } from "@/lib/storage/admin-supabase";

interface RevenueChartProps {
  data: RevenueTrend[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return `R${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis 
            tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <Tooltip 
            formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ""}
            labelFormatter={formatDate}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
