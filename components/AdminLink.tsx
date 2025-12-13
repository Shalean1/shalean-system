"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLink() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkAuth();
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
      title="Admin Dashboard"
    >
      <Settings className="w-4 h-4" />
      <span className="hidden lg:inline">Admin</span>
    </Link>
  );
}
