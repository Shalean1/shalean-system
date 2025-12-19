import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import CleanerNav from "@/components/cleaner/CleanerNav";
import PageviewTracker from "@/components/PageviewTracker";
import { headers } from "next/headers";

export default async function CleanerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const headersList = await headers();
    // Get the pathname from the custom header set by middleware
    const pathname = headersList.get("x-pathname") || "";
    
    // Allow access to login page without authentication checks
    // Also check if pathname includes login to handle edge cases
    if (pathname === "/cleaner/login" || pathname.includes("/cleaner/login")) {
      return <>{children}</>;
    }

    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
      redirect("/cleaner/login");
    }

    // Check if user is a cleaner
    const cleaner = await getCurrentCleaner();
    
    if (!cleaner) {
      // Not a cleaner account, redirect to regular login
      redirect("/auth/login");
    }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:z-30 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <img 
              src="/shalean-logo.png" 
              alt="Shalean" 
              className="h-8 md:h-10 w-auto"
            />
            <span className="ml-2 text-sm font-medium text-gray-600">Cleaner Portal</span>
          </Link>
        </div>
        {/* Navigation */}
        <CleanerNav variant="desktop" />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button - shown in header on mobile */}
              <div className="md:hidden flex items-center gap-4">
                <Link href="/" className="flex items-center">
                  <img 
                    src="/shalean-logo.png" 
                    alt="Shalean" 
                    className="h-8 w-auto"
                  />
                </Link>
                <CleanerNav variant="mobile" />
              </div>
              {/* Desktop: Empty space, Mobile: Hidden */}
              <div className="hidden md:block"></div>
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{cleaner.name}</p>
                  <p className="text-xs text-gray-500">Cleaner</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {cleaner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <PageviewTracker />
          {children}
        </main>
      </div>
    </div>
    );
  } catch (error) {
    // If there's an error, check if we're on the login page and allow access
    // Otherwise, redirect to login
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    
    if (pathname === "/cleaner/login" || pathname.includes("/cleaner/login")) {
      return <>{children}</>;
    }
    
    // Redirect to login on error
    redirect("/cleaner/login");
  }
}
