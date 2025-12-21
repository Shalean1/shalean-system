"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ServiceBreakdown } from "@/lib/storage/admin-supabase";

interface ServiceBreakdownChartProps {
  data: ServiceBreakdown[];
}

const COLORS = ["#3b82f6", "#a855f7", "#10b981", "#f59e0b", "#ef4444"];

export default function ServiceBreakdownChart({ data }: ServiceBreakdownChartProps) {
  const chartData = data.map((item) => ({
    name: item.service,
    value: item.percentage,
    count: item.count,
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Service Breakdown</h3>
        <p className="text-sm text-gray-600 mt-1">Distribution of bookings by service type</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${percent !== undefined ? (percent * 100).toFixed(1) : '0.0'}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number | undefined) => value !== undefined ? `${value.toFixed(1)}%` : ""}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-700">
              {item.name} ({item.value.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
