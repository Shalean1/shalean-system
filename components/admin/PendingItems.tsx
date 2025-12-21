import Link from "next/link";
import { FileText, Briefcase, Calendar, AlertTriangle } from "lucide-react";

interface PendingItemsProps {
  pendingQuotes: number;
  pendingApplications: number;
  pendingBookings: number;
}

export default function PendingItems({
  pendingQuotes,
  pendingApplications,
  pendingBookings,
}: PendingItemsProps) {
  const items = [
    {
      title: "Pending Quotes",
      count: pendingQuotes,
      icon: FileText,
      color: "blue",
      href: "/admin/bookings?status=pending",
    },
    {
      title: "Pending Applications",
      count: pendingApplications,
      icon: Briefcase,
      color: "purple",
      href: "/admin/bookings?status=pending&cleaner_response=null",
    },
    {
      title: "Pending Bookings",
      count: pendingBookings,
      icon: Calendar,
      color: "yellow",
      href: "/admin/bookings?status=pending",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          pill: "bg-blue-100 text-blue-700",
          icon: "text-blue-600",
        };
      case "purple":
        return {
          pill: "bg-purple-100 text-purple-700",
          icon: "text-purple-600",
        };
      case "yellow":
        return {
          pill: "bg-yellow-100 text-yellow-700",
          icon: "text-yellow-600",
        };
      default:
        return {
          pill: "bg-gray-100 text-gray-700",
          icon: "text-gray-600",
        };
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-bold text-gray-900">Pending Items</h3>
        </div>
        <p className="text-sm text-gray-600">Requires attention</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const colors = getColorClasses(item.color);
          return (
            <Link
              key={item.title}
              href={item.href}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <Icon className={`w-5 h-5 ${colors.icon}`} />
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors.pill}`}>
                  {item.count}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
              <p className="text-xs text-gray-600">Requires attention</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
