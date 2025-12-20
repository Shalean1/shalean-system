"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, User, MoreHorizontal, DollarSign, TrendingUp, Plus } from "lucide-react";
import { useState } from "react";
import SidebarMenu from "./SidebarMenu";

export default function BottomNavigation() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hide bottom navigation on certain pages
  if (
    pathname === "/booking/quote" ||
    pathname === "/booking/quote/confirmation" ||
    pathname?.startsWith("/booking/service/") ||
    pathname?.includes("/confirmation") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/cleaner/login")
  ) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/" || href === "/dashboard" || href === "/cleaner") {
      return pathname === "/" || pathname === "/dashboard" || pathname === "/cleaner";
    }
    return pathname?.startsWith(href);
  };

  // Check if we're on a cleaner page
  const isCleanerPage = pathname?.startsWith("/cleaner");

  // Determine home href based on current path
  const homeHref = pathname?.startsWith("/dashboard") 
    ? "/dashboard" 
    : pathname?.startsWith("/cleaner")
    ? "/cleaner"
    : "/";

  // Cleaner navigation items
  const cleanerNavItems = [
    {
      href: "/cleaner",
      label: "Jobs",
      icon: Calendar,
    },
    {
      href: "/cleaner/earnings",
      label: "Earnings",
      icon: DollarSign,
    },
    {
      href: "/cleaner/earn-more",
      label: "More jobs",
      icon: TrendingUp,
    },
  ];

  // Regular navigation items
  const regularNavItems = [
    {
      href: homeHref,
      label: "Jobs",
      icon: Home,
    },
    {
      href: "/dashboard/bookings",
      label: "Bookings",
      icon: Calendar,
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: User,
    },
  ];

  const navItems = isCleanerPage ? cleanerNavItems : regularNavItems;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  active
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className={`w-6 h-6 ${active ? "text-blue-600" : ""}`} />
                <span className={`text-xs mt-1 font-medium ${active ? "text-blue-600" : "text-gray-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* More button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isSidebarOpen
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            aria-label="More options"
          >
            {isCleanerPage ? (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
            ) : (
              <MoreHorizontal className={`w-6 h-6 ${isSidebarOpen ? "text-blue-600" : ""}`} />
            )}
            <span className={`text-xs mt-1 font-medium ${isSidebarOpen ? "text-blue-600" : "text-gray-500"}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Sidebar Menu */}
      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}




