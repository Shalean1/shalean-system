"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  RotateCcw,
  Users,
  UserCheck,
  UserCog,
  DollarSign,
  Tag,
  Menu,
  X,
  Ticket,
  FileText,
  Layout,
  Star,
  Receipt,
  Briefcase,
  Settings,
  Bell,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";

interface AdminNavProps {
  onMobileMenuClose?: () => void;
  variant?: "mobile" | "desktop";
}

export default function AdminNav({ onMobileMenuClose, variant }: AdminNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        {
          href: "/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        {
          href: "/admin/bookings",
          label: "Bookings",
          icon: Calendar,
        },
        {
          href: "/admin/schedule",
          label: "Schedule",
          icon: Clock,
        },
        {
          href: "/admin/recurring-schedules",
          label: "Recurring Schedules",
          icon: RotateCcw,
        },
      ],
    },
    {
      title: "PEOPLE",
      items: [
        {
          href: "/admin/customers",
          label: "Customers",
          icon: Users,
        },
        {
          href: "/admin/recurring-customers",
          label: "Recurring Customers",
          icon: UserCheck,
        },
        {
          href: "/admin/cleaners",
          label: "Cleaners",
          icon: UserCog,
        },
      ],
    },
    {
      title: "FINANCIAL",
      items: [
        {
          href: "/admin/payments",
          label: "Payments",
          icon: DollarSign,
        },
        {
          href: "/admin/pricing",
          label: "Pricing",
          icon: Tag,
        },
        {
          href: "/admin/discount-codes",
          label: "Discount Codes",
          icon: Ticket,
        },
      ],
    },
    {
      title: "CONTENT",
      items: [
        {
          href: "/admin/blog",
          label: "Blog",
          icon: FileText,
        },
        {
          href: "/admin/cms",
          label: "CMS",
          icon: Layout,
        },
        {
          href: "/admin/reviews",
          label: "Reviews",
          icon: Star,
        },
      ],
    },
    {
      title: "BUSINESS",
      items: [
        {
          href: "/admin/quotes",
          label: "Quotes",
          icon: Receipt,
        },
        {
          href: "/admin/applications",
          label: "Applications",
          icon: Briefcase,
        },
        {
          href: "/admin/services",
          label: "Services",
          icon: Sparkles,
        },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        {
          href: "/admin/notifications",
          label: "Notifications",
          icon: Bell,
        },
        {
          href: "/admin/check-services",
          label: "Check Services",
          icon: CheckCircle2,
        },
        {
          href: "/admin/settings",
          label: "Settings",
          icon: Settings,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname?.startsWith(href);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    onMobileMenuClose?.();
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      {variant === "mobile" && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && variant === "mobile" && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform overflow-y-auto">
            <nav className="flex flex-col p-4 space-y-6">
              {navSections.map((section) => (
                <div key={section.title}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleLinkClick}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                            active
                              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Desktop Sidebar Navigation */}
      {variant === "desktop" && (
        <nav className="flex flex-col h-full overflow-y-auto">
          <div className="flex flex-col space-y-6 px-4 pt-2 pb-4 flex-1">
            {navSections.map((section) => (
              <div key={section.title}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                          active
                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
