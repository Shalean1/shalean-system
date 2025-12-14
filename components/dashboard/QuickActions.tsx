import Link from "next/link";
import { 
  Calendar, 
  CalendarDays, 
  FileText, 
  MessageCircle, 
  Plus,
  RotateCcw
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      label: "Book New Service",
      description: "Schedule a cleaning service",
      href: "/booking/service/standard/details",
      icon: Plus,
      primary: true,
    },
    {
      label: "Schedule Recurring",
      description: "Set up weekly or monthly cleaning",
      href: "/booking/service/standard/details",
      icon: RotateCcw,
      primary: false,
    },
    {
      label: "View Calendar",
      description: "See all your appointments",
      href: "/dashboard/bookings",
      icon: CalendarDays,
      primary: false,
    },
    {
      label: "Contact Support",
      description: "Get help or ask questions",
      href: "/#contact",
      icon: MessageCircle,
      primary: false,
    },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 transform ${
                action.primary
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:-translate-y-1 shadow-lg shadow-blue-200"
                  : "bg-white border-gray-200 text-gray-900 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              <div className="flex flex-col items-start">
                <div
                  className={`p-2.5 rounded-xl mb-3 transition-transform duration-300 group-hover:scale-110 ${
                    action.primary
                      ? "bg-white bg-opacity-20 backdrop-blur-sm"
                      : "bg-gradient-to-br from-blue-100 to-blue-50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      action.primary ? "text-white" : "text-blue-600"
                    }`}
                  />
                </div>
                <h3 className="font-semibold text-base mb-1 group-hover:text-blue-600 transition-colors">
                  {action.label}
                </h3>
                <p
                  className={`text-sm ${
                    action.primary
                      ? "text-blue-100"
                      : "text-gray-600"
                  }`}
                >
                  {action.description}
                </p>
                {action.primary && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
