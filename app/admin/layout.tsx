import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getUserDisplayName, isUserAdmin } from "@/lib/storage/profile-supabase";
import AdminNav from "@/components/admin/AdminNav";
import UserMenu from "@/components/dashboard/UserMenu";
import { Bell } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Check if user has admin role
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const displayName = await getUserDisplayName();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:top-0 md:left-0 md:bottom-0 md:z-30 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <Link href="/" className="flex items-center">
            <img 
              src="/shalean-logo.png" 
              alt="Shalean" 
              className="h-8 md:h-10 w-auto"
            />
          </Link>
        </div>
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <AdminNav variant="desktop" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 flex-shrink-0">
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
                <AdminNav variant="mobile" />
              </div>
              {/* Desktop: Title */}
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              </div>
              {/* User Menu */}
              <div className="flex items-center gap-2 md:gap-4">
                <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <UserMenu userEmail={user.email || ""} displayName={displayName} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
