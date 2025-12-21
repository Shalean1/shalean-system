"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Calendar, 
  User, 
  Menu, 
  X, 
  Users, 
  MapPin, 
  CreditCard, 
  Coins, 
  Ticket, 
  UserPlus, 
  HelpCircle, 
  Mail, 
  FileText,
  DollarSign
} from "lucide-react";
import { useState, useEffect } from "react";

interface DashboardNavProps {
  onMobileMenuClose?: () => void;
  variant?: "mobile" | "desktop";
}

export default function DashboardNav({ onMobileMenuClose, variant }: DashboardNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      href: "/dashboard",
      label: "Jobs",
      icon: Home,
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: User,
    },
    {
      href: "/dashboard/bookings",
      label: "Bookings",
      icon: Calendar,
    },
    {
      href: "/dashboard/cleaners",
      label: "Cleaners",
      icon: Users,
    },
    {
      href: "/dashboard/locations",
      label: "Locations",
      icon: MapPin,
    },
    {
      href: "/dashboard/payments",
      label: "Payments",
      icon: CreditCard,
    },
    {
      href: "/dashboard/earnings",
      label: "Earnings",
      icon: DollarSign,
    },
    {
      href: "/dashboard/shalcred",
      label: "ShalCred",
      icon: Coins,
    },
    {
      href: "/dashboard/vouchers",
      label: "Vouchers",
      icon: Ticket,
    },
    {
      href: "/dashboard/refer-earn",
      label: "Refer & Earn",
      icon: UserPlus,
    },
    {
      href: "/dashboard/help",
      label: "Help",
      icon: HelpCircle,
    },
    {
      href: "/dashboard/contact",
      label: "Contact Us",
      icon: Mail,
    },
    {
      href: "/dashboard/terms",
      label: "Terms & Conditions",
      icon: FileText,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(href);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    onMobileMenuClose?.();
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button - only show when variant is mobile */}
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sidebar Drawer */}
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform overflow-y-auto">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.slice(0, 9).map((item) => {
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
              {/* Footer section for Help, Contact Us, Terms */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                {navItems.slice(9).map((item) => {
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
            </nav>
          </div>
        </>
      )}

      {/* Desktop Sidebar Navigation - only show when variant is desktop */}
      {variant === "desktop" && (
        <nav className="flex flex-col h-full overflow-y-auto">
          <div className="flex flex-col space-y-1 px-4 pt-2 pb-4 flex-1">
            {navItems.slice(0, 9).map((item) => {
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
          {/* Footer section for Help, Contact Us, Terms */}
          <div className="border-t border-gray-200 mt-auto pt-2 pb-4">
            <div className="flex flex-col space-y-1 px-4">
              {navItems.slice(9).map((item) => {
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
        </nav>
      )}
    </>
  );
}
