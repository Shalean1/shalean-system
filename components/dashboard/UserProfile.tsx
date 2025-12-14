import Link from "next/link";
import { UserProfile as UserProfileType } from "@/lib/storage/profile-supabase";
import { User, Mail, Phone, Edit } from "lucide-react";

interface UserProfileProps {
  profile: UserProfileType;
}

export default function UserProfile({ profile }: UserProfileProps) {
  const displayName =
    profile.firstName ||
    profile.fullName ||
    profile.email.split("@")[0] ||
    "User";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {displayName}
            </h3>
            <p className="text-sm text-gray-600">{profile.email}</p>
          </div>
        </div>
        <Link
          href="/dashboard/profile"
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit Profile"
        >
          <Edit className="w-5 h-5" />
        </Link>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        {profile.phone && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{profile.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          <span>{profile.email}</span>
        </div>
      </div>

      <Link
        href="/dashboard/profile"
        className="mt-4 block w-full text-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
      >
        Manage Account
      </Link>
    </div>
  );
}
