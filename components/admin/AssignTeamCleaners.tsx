"use client";

import { useState, useEffect } from "react";
import { Booking } from "@/lib/types/booking";
import {
  getTeamMembersAction,
  getBookingCleanersAction,
  assignCleanersToBookingAction,
  getAllActiveCleanersAction,
} from "@/app/actions/booking-cleaners";
import { TeamMember, AssignedCleaner, CleanerOption } from "@/lib/storage/booking-cleaners-supabase";
import { Users, Check, X, Loader2, Save } from "lucide-react";

interface AssignTeamCleanersProps {
  booking: Booking;
}

interface CleanerSelectOption {
  cleanerId: string;
  cleanerName: string;
}

export default function AssignTeamCleaners({ booking }: AssignTeamCleanersProps) {
  const [availableCleaners, setAvailableCleaners] = useState<CleanerSelectOption[]>([]);
  const [assignedCleaners, setAssignedCleaners] = useState<AssignedCleaner[]>([]);
  const [selectedCleanerIds, setSelectedCleanerIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Show this component for team bookings OR deep/move-in-out bookings
  const isTeamBooking = !!booking.teamId;
  const isTeamService = booking.service === 'deep' || booking.service === 'move-in-out';
  
  if (!isTeamBooking && !isTeamService) {
    return null;
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        let cleanersData: CleanerSelectOption[] = [];
        
        const teamBooking = !!booking.teamId;
        const teamService = booking.service === 'deep' || booking.service === 'move-in-out';
        
        if (teamBooking && booking.teamId) {
          // If it's a team booking, get team members
          const teamMembers = await getTeamMembersAction(booking.teamId);
          cleanersData = teamMembers.map(m => ({
            cleanerId: m.cleanerId,
            cleanerName: m.cleanerName,
          }));
        } else if (teamService) {
          // If it's a deep/move-in-out booking without team, get all cleaners
          const allCleaners = await getAllActiveCleanersAction();
          cleanersData = allCleaners.map(c => ({
            cleanerId: c.cleanerId,
            cleanerName: c.cleanerName,
          }));
        }
        
        const assigned = await getBookingCleanersAction(booking.id);
        
        setAvailableCleaners(cleanersData);
        setAssignedCleaners(assigned);
        setSelectedCleanerIds(new Set(assigned.map(c => c.cleanerId)));
      } catch (err) {
        console.error("Error loading cleaner data:", err);
        setError(err instanceof Error ? err.message : "Failed to load cleaner data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [booking.teamId, booking.id, booking.service]);

  const handleToggleCleaner = (cleanerId: string) => {
    setSelectedCleanerIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cleanerId)) {
        newSet.delete(cleanerId);
      } else {
        newSet.add(cleanerId);
      }
      return newSet;
    });
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await assignCleanersToBookingAction(
        booking.id,
        Array.from(selectedCleanerIds)
      );

      if (result.success) {
        setSuccess(true);
        // Reload assigned cleaners to reflect changes
        const assigned = await getBookingCleanersAction(booking.id);
        setAssignedCleaners(assigned);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save assignments");
      }
    } catch (err) {
      console.error("Error saving assignments:", err);
      setError(err instanceof Error ? err.message : "Failed to save assignments");
    } finally {
      setSaving(false);
    }
  };

  const formatTeamName = (teamId: string) => {
    return teamId
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getTitle = () => {
    if (isTeamBooking && booking.teamId) {
      return `Assign Cleaners - ${formatTeamName(booking.teamId)}`;
    }
    const serviceName = booking.service === 'deep' ? 'Deep Cleaning' : 'Move In/Out Cleaning';
    return `Assign Cleaners - ${serviceName}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading team members...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          {getTitle()}
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <X className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-4 h-4" />
            <span className="text-sm">Cleaner assignments saved successfully!</span>
          </div>
        </div>
      )}

      {availableCleaners.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>
            {isTeamBooking 
              ? "No team members found for this team." 
              : "No cleaners available."}
          </p>
          <p className="text-sm mt-2">
            {isTeamBooking 
              ? "Please add cleaners to the team first."
              : "Please ensure cleaners are marked as active in the system."}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Select the cleaners who will work on this booking:
            </p>
            <div className="space-y-2">
              {availableCleaners.map((cleaner) => {
                const isSelected = selectedCleanerIds.has(cleaner.cleanerId);
                return (
                  <label
                    key={cleaner.cleanerId}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleCleaner(cleaner.cleanerId)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{cleaner.cleanerName}</div>
                      <div className="text-sm text-gray-500">ID: {cleaner.cleanerId}</div>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {selectedCleanerIds.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>{selectedCleanerIds.size}</strong> cleaner{selectedCleanerIds.size !== 1 ? "s" : ""} selected
              </p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Assignments</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
