"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useUser } from "@/lib/hooks/useSupabase";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/service-areas", label: "Locations" },
  { href: "/#services", label: "Services" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading: userLoading } = useUser();

  // Hide header on booking form pages, auth pages, cleaner pages, and admin pages
  if (
    pathname === "/booking/quote" ||
    pathname === "/booking/quote/confirmation" ||
    pathname?.startsWith("/booking/service/") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/cleaner") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2" aria-label="Shalean Cleaning Services Home">
              <Image 
                src="/shalean-logo.png" 
                alt="Shalean" 
                width={40}
                height={40}
                className="h-8 md:h-10 w-auto"
                priority
              />
              <span className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'cursive, system-ui' }}>
                Shalean
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {!userLoading && user && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors border border-gray-300 text-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            <Link
              href="/booking/quote"
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors border border-gray-300 text-sm"
            >
              Get Free Quote
            </Link>
            {!userLoading && !user && (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors border border-gray-300 text-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2 pt-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-2 border-t border-gray-200">
                {!userLoading && user && (
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors border border-gray-300 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/booking/quote"
                  className="px-6 py-2 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors border border-gray-300 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Free Quote
                </Link>
                {!userLoading && !user && (
                  <Link
                    href="/auth/login"
                    className="px-6 py-2 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors border border-gray-300 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
