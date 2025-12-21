"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  getAllApplications,
  getApplicationStats,
  updateApplicationStatus,
  deleteApplication,
} from "@/app/actions/admin-applications";
import { CleanerApplication, CleanerApplicationStatus } from "@/lib/types/cleaner-application";
import {
  Briefcase,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Languages,
  User,
  Calendar,
  FileText,
  Edit,
  X,
} from "lucide-react";
import Link from "next/link";

type StatusFilter = CleanerApplicationStatus | "all";

type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc" | "status";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<CleanerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [stats, setStats] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<CleanerApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const [applicationsData, statsData] = await Promise.all([
        getAllApplications(),
        getApplicationStats(),
      ]);
      setApplications(applicationsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Filter and search applications
  const filteredApplications = useMemo(() => {
    let result = applications;

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((app) => app.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((app) => {
        const name = `${app.firstName} ${app.lastName}`.toLowerCase();
        const email = app.email.toLowerCase();
        const phone = app.phone.toLowerCase();
        const experience = app.previousExperience?.toLowerCase() || "";
        const additionalInfo = app.additionalInfo?.toLowerCase() || "";
        
        return (
          name.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          experience.includes(query) ||
          additionalInfo.includes(query)
        );
      });
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name-asc":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "name-desc":
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  }, [applications, searchQuery, statusFilter, sortBy]);

  const handleStatusUpdate = async (id: string, newStatus: CleanerApplicationStatus) => {
    setUpdating(true);
    try {
      const result = await updateApplicationStatus(id, newStatus);
      if (result.success) {
        await fetchApplications();
        if (selectedApplication?.id === id) {
          setSelectedApplication({ ...selectedApplication, status: newStatus });
        }
      } else {
        alert(`Failed to update status: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update application status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return;
    }

    setUpdating(true);
    try {
      const result = await deleteApplication(id);
      if (result.success) {
        await fetchApplications();
        if (selectedApplication?.id === id) {
          setShowModal(false);
          setSelectedApplication(null);
        }
      } else {
        alert(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete application");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: CleanerApplicationStatus) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      ),
      reviewed: (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Eye className="w-3 h-3 mr-1" />
          Reviewed
        </span>
      ),
      approved: (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approved
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>
      ),
      hired: (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Hired
        </span>
      ),
    };
    return badges[status];
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cleaner Applications</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Review and manage job applications from prospective cleaners
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchApplications}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Reviewed</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.reviewed}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Approved</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Rejected</div>
            <div className="text-xl md:text-2xl font-bold text-red-600">{stats.rejected}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Hired</div>
            <div className="text-xl md:text-2xl font-bold text-purple-600">{stats.hired}</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4 md:mb-6">
        <div className="space-y-3 md:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or experience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs md:text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>

            <label className="text-xs md:text-sm font-medium text-gray-700 ml-2">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="status">Status</option>
            </select>

            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="text-xs md:text-sm text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium underline touch-manipulation"
              >
                Clear filters
              </button>
            )}
            <div className="text-xs md:text-sm text-gray-600 md:ml-auto">
              Showing {filteredApplications.length} of {applications.length} applications
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No applications found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No applications have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left: Applicant Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.firstName} {application.lastName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {application.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {application.phone}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(application.status)}
                          </div>
                        </div>

                        {/* Experience */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {application.experienceYears} {application.experienceYears === 1 ? "year" : "years"} experience
                          </span>
                          {application.preferredAreas && application.preferredAreas.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {application.preferredAreas.join(", ")}
                            </span>
                          )}
                          {application.languages && application.languages.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Languages className="w-4 h-4" />
                              {application.languages.join(", ")}
                            </span>
                          )}
                        </div>

                        {/* Previous Experience Preview */}
                        {application.previousExperience && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {application.previousExperience}
                          </p>
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors touch-manipulation"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    {application.status === "pending" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStatusUpdate(application.id, "approved")}
                          disabled={updating}
                          className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors touch-manipulation disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application.id, "rejected")}
                          disabled={updating}
                          className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors touch-manipulation disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Application Details
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                    <p className="text-gray-900">{selectedApplication.experienceYears} {selectedApplication.experienceYears === 1 ? "year" : "years"}</p>
                  </div>
                  {selectedApplication.previousExperience && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Previous Experience</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.previousExperience}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability & Preferences */}
              {(selectedApplication.availability || selectedApplication.preferredAreas?.length || selectedApplication.languages?.length) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability & Preferences</h3>
                  <div className="space-y-4">
                    {selectedApplication.availability && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Availability</label>
                        <p className="text-gray-900">{selectedApplication.availability}</p>
                      </div>
                    )}
                    {selectedApplication.preferredAreas && selectedApplication.preferredAreas.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Preferred Areas</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedApplication.preferredAreas.map((area, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedApplication.languages && selectedApplication.languages.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Languages</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedApplication.languages.map((lang, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* References */}
              {selectedApplication.referencesInfo && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">References</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.referencesInfo}</p>
                </div>
              )}

              {/* Additional Information */}
              {selectedApplication.additionalInfo && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.additionalInfo}</p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                {selectedApplication.adminNotes ? (
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">{selectedApplication.adminNotes}</p>
                ) : (
                  <p className="text-gray-400 italic">No admin notes</p>
                )}
              </div>

              {/* Timestamps */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Applied:</span> {new Date(selectedApplication.createdAt).toLocaleString()}
                  </div>
                  {selectedApplication.reviewedAt && (
                    <div>
                      <span className="font-medium">Reviewed:</span> {new Date(selectedApplication.reviewedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                {selectedApplication.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, "reviewed")}
                      disabled={updating}
                      className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, "approved")}
                      disabled={updating}
                      className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, "rejected")}
                      disabled={updating}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedApplication.status === "approved" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedApplication.id, "hired")}
                    disabled={updating}
                    className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                  >
                    Mark as Hired
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedApplication.id)}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
