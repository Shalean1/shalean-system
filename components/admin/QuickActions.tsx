import Link from "next/link";
import { Plus, Calendar, FileText, Users } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "New Booking",
      icon: Plus,
      href: "/booking/quote",
      color: "blue",
    },
    {
      title: "View Bookings",
      icon: Calendar,
      href: "/admin/bookings",
      color: "blue",
    },
    {
      title: "View Quotes",
      icon: FileText,
      href: "/admin/bookings?status=pending",
      color: "blue",
    },
    {
      title: "Manage Cleaners",
      icon: Users,
      href: "/admin/cleaners",
      color: "blue",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-600 mt-1">Common tasks and shortcuts</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <div className="p-3 bg-blue-100 rounded-lg mb-3">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">
                {action.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
