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
      href: "/contact",
      icon: MessageCircle,
      primary: false,
    },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Quick Actions
      </h2>
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-3 -mx-1 md:mx-0">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`group relative p-1.5 md:p-4 rounded-lg md:rounded-xl border-2 transition-all duration-300 transform min-w-0 flex flex-col flex-1 md:flex-none ${
                action.primary
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:-translate-y-1 shadow-lg shadow-blue-200"
                  : "bg-white border-gray-200 text-gray-900 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              <div className="flex flex-col items-center md:items-start h-full w-full">
                <div
                  className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl mb-1.5 md:mb-3 transition-transform duration-300 group-hover:scale-110 flex-shrink-0 ${
                    action.primary
                      ? "bg-white bg-opacity-20 backdrop-blur-sm"
                      : "bg-gradient-to-br from-blue-100 to-blue-50"
                  }`}
                >
                  <Icon
                    className={`w-3 h-3 md:w-5 md:h-5 ${
                      action.primary ? "text-white" : "text-blue-600"
                    }`}
                  />
                </div>
                <h3 className="font-semibold text-[9px] md:text-base mb-0 md:mb-1 text-center md:text-left group-hover:text-blue-600 transition-colors leading-tight break-words w-full">
                  <span className="hidden md:inline">{action.label}</span>
                  <span className="md:hidden">
                    {action.label === "Book New Service" ? "Book" :
                     action.label === "Schedule Recurring" ? "Recurring" :
                     action.label === "View Calendar" ? "Calendar" :
                     action.label === "Contact Support" ? "Support" : action.label}
                  </span>
                </h3>
                <p
                  className={`text-[9px] md:text-sm hidden md:block ${
                    action.primary
                      ? "text-blue-100"
                      : "text-gray-600"
                  }`}
                >
                  {action.description}
                </p>
                {action.primary && (
                  <div className="absolute top-2 md:top-4 right-2 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
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
