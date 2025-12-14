"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, User, MoreHorizontal } from "lucide-react";
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
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/" || href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname?.startsWith(href);
  };

  // Determine home href based on current path
  const homeHref = pathname?.startsWith("/dashboard") ? "/dashboard" : "/";

  const navItems = [
    {
      href: homeHref,
      label: "Home",
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
            <MoreHorizontal className={`w-6 h-6 ${isSidebarOpen ? "text-blue-600" : ""}`} />
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


