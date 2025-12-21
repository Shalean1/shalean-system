"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Share2,
  Calendar,
  MapPin,
  Edit,
  UserPlus,
  TrendingUp,
  CheckSquare,
  Star,
  DollarSign,
  User,
  FileText,
  RefreshCw,
  Menu, 
  X, 
  LogOut,
  ChevronRight,
  LayoutDashboard,
  List,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";

interface CleanerNavProps {
  onMobileMenuClose?: () => void;
  variant?: "mobile" | "desktop";
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: boolean;
}

export default function CleanerNav({ onMobileMenuClose, variant }: CleanerNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    // Main navigation - most frequently used
    {
      href: "/cleaner",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/cleaner/bookings",
      label: "Bookings",
      icon: List,
    },
    {
      href: "/cleaner/schedule",
      label: "Schedule",
      icon: Clock,
    },
    {
      href: "/cleaner/profile",
      label: "Profile",
      icon: User,
    },
    // Work management
    {
      href: "/cleaner/work-days",
      label: "My Work Days",
      icon: Calendar,
    },
    {
      href: "/cleaner/areas",
      label: "My Areas",
      icon: MapPin,
    },
    {
      href: "/cleaner/checklist",
      label: "Checklist",
      icon: CheckSquare,
    },
    // Performance & earnings
    {
      href: "/cleaner/performance",
      label: "My Performance",
      icon: Star,
    },
    {
      href: "/cleaner/earnings",
      label: "My Earnings",
      icon: DollarSign,
    },
    {
      href: "/cleaner/earn-more",
      label: "More jobs",
      icon: TrendingUp,
    },
    // Account & settings
    {
      href: "/cleaner/info",
      label: "My Info",
      icon: FileText,
    },
    {
      href: "/cleaner/change-info",
      label: "Change my info",
      icon: Edit,
    },
    {
      href: "/cleaner/share-profile",
      label: "Share my profile",
      icon: Share2,
    },
    {
      href: "/cleaner/contract",
      label: "My Contract",
      icon: FileText,
    },
    // Referrals
    {
      href: "/cleaner/refer-friend",
      label: "Refer a friend",
      icon: UserPlus,
    },
    // Actions
    {
      href: "#",
      label: "Refresh Page",
      icon: RefreshCw,
      isAction: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/cleaner") {
      return pathname === "/cleaner" || pathname === "/cleaner/";
    }
    if (href === "#") {
      return false;
    }
    return pathname?.startsWith(href);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    onMobileMenuClose?.();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const { logout } = await import("@/app/actions/auth");
    await logout();
    window.location.href = "/cleaner/login";
  };

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
            <nav className="flex flex-col">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const isAction = item.isAction || false;
                
                const linkContent = (
                  <>
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </>
                );

                if (isAction) {
                  return (
                    <div key={item.href || `action-${index}`}>
                      {index > 0 && <div className="border-t border-gray-200" />}
                      <button
                        onClick={() => {
                          handleRefresh();
                          handleLinkClick();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                      >
                        {linkContent}
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={item.href}>
                    {index > 0 && <div className="border-t border-gray-200" />}
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 px-4 py-3 transition-all ${
                        active
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {linkContent}
                    </Link>
                  </div>
                );
              })}
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-gray-600 hover:text-red-600 hover:bg-red-50 mt-4 border-t border-gray-200 pt-4"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Desktop Sidebar Navigation - only show when variant is desktop */}
      {variant === "desktop" && (
        <nav className="flex flex-col h-full overflow-y-auto">
          <div className="flex flex-col flex-1 pt-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const isAction = item.isAction || false;
              
              const linkContent = (
                <>
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </>
              );

              if (isAction) {
                return (
                  <div key={item.href || `action-${index}`}>
                    {index > 0 && <div className="border-t border-gray-200" />}
                    <button
                      onClick={handleRefresh}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                    >
                      {linkContent}
                    </button>
                  </div>
                );
              }

              return (
                <div key={item.href}>
                  {index > 0 && <div className="border-t border-gray-200" />}
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 transition-all ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {linkContent}
                  </Link>
                </div>
              );
            })}
          </div>
          {/* Logout Button */}
          <div className="border-t border-gray-200 mt-auto pt-2 pb-4">
            <div className="flex flex-col space-y-1 px-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
