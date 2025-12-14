"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
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
  LogOut,
  Settings
} from "lucide-react";
import { useUser } from "@/lib/hooks/useSupabase";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();

  const menuItems = [
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
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">More</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500">Account</p>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
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

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-4 space-y-1">
            {user ? (
              <>
                <Link
                  href="/dashboard/profile"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


