import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  iconColor?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-blue-600",
}: MetricCardProps) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "text-red-600" : "text-red-600"; // Both negative in the image

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gray-50 ${iconColor}`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
      <div className="flex items-center">
        <span className={`text-sm font-medium ${changeColor}`}>
          {change >= 0 ? "+" : ""}{change.toFixed(2)}%
        </span>
        <span className="text-sm text-gray-600 ml-2">from yesterday</span>
      </div>
    </div>
  );
}
