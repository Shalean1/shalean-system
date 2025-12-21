"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getAllNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  Notification,
} from "@/app/actions/admin-notifications";
import {
  Bell,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  CheckCheck,
  AlertTriangle,
  DollarSign,
  Calendar,
  Settings,
} from "lucide-react";

type TypeFilter = Notification["type"] | "all";
type PriorityFilter = Notification["priority"] | "all";
type ReadFilter = "all" | "read" | "unread";

type SortOption = "date-desc" | "date-asc" | "priority-desc" | "priority-asc";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [stats, setStats] = useState<any>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [notificationsData, statsData] = await Promise.all([
        getAllNotifications(),
        getNotificationStats(),
      ]);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let result = notifications;

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((n) => n.type === typeFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((n) => n.priority === priorityFilter);
    }

    // Apply read filter
    if (readFilter !== "all") {
      if (readFilter === "read") {
        result = result.filter((n) => n.isRead);
      } else {
        result = result.filter((n) => !n.isRead);
      }
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((notification) => {
        const title = notification.title.toLowerCase();
        const message = notification.message.toLowerCase();
        const relatedId = (notification.relatedEntityId || "").toLowerCase();

        return (
          title.includes(query) ||
          message.includes(query) ||
          relatedId.includes(query)
        );
      });
    }

    return result;
  }, [notifications, typeFilter, priorityFilter, readFilter, searchQuery]);

  // Sort notifications
  const sortedNotifications = useMemo(() => {
    const result = [...filteredNotifications];

    switch (sortBy) {
      case "date-desc":
        return result.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      case "date-asc":
        return result.sort((a, b) => {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
      case "priority-desc":
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        return result.sort((a, b) => {
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        });
      case "priority-asc":
        const priorityOrderAsc = { urgent: 4, high: 3, normal: 2, low: 1 };
        return result.sort((a, b) => {
          return (priorityOrderAsc[a.priority] || 0) - (priorityOrderAsc[b.priority] || 0);
        });
      default:
        return result;
    }
  }, [filteredNotifications, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "booking":
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case "payment":
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case "system":
        return <Settings className="w-5 h-5 text-gray-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeBadgeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-700";
      case "error":
        return "bg-red-100 text-red-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "booking":
        return "bg-blue-100 text-blue-700";
      case "payment":
        return "bg-green-100 text-green-700";
      case "system":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getPriorityBadgeColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "normal":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "low":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    setActionLoading(id);
    try {
      if (currentRead) {
        await markNotificationAsUnread(id);
      } else {
        await markNotificationAsRead(id);
      }
      await fetchNotifications();
    } catch (error) {
      console.error("Error toggling read status:", error);
      alert("Failed to update notification");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading("mark-all");
    try {
      await markAllNotificationsAsRead();
      await fetchNotifications();
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error("Error marking all as read:", error);
      alert("Failed to mark all as read");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) {
      return;
    }
    setActionLoading(id);
    try {
      await deleteNotification(id);
      await fetchNotifications();
      setSelectedNotifications((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAllRead = async () => {
    if (!confirm("Are you sure you want to delete all read notifications?")) {
      return;
    }
    setActionLoading("delete-all-read");
    try {
      await deleteAllReadNotifications();
      await fetchNotifications();
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      alert("Failed to delete read notifications");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedNotifications((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === sortedNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(sortedNotifications.map((n) => n.id)));
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading notifications...</p>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Manage and view all system notifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllRead}
              disabled={actionLoading === "mark-all" || notifications.filter((n) => !n.isRead).length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === "mark-all" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              <span>Mark All Read</span>
            </button>
            <button
              onClick={fetchNotifications}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Unread</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-600">
              {stats.byReadStatus.unread || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Read</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {stats.byReadStatus.read || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Showing</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">
              {sortedNotifications.length}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4 md:mb-6">
        <div className="space-y-3 md:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-xs md:text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="booking">Booking</option>
              <option value="payment">Payment</option>
              <option value="system">System</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
              className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            {/* Read Filter */}
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as ReadFilter)}
              className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            {/* Sort */}
            <div className="flex items-center gap-2 md:ml-auto">
              <Filter className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="flex-1 md:flex-none px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none touch-manipulation"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="priority-desc">Priority (High to Low)</option>
                <option value="priority-asc">Priority (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Results Count and Bulk Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-200">
            <div className="text-xs md:text-sm text-gray-600">
              Showing {sortedNotifications.length} of {notifications.length} notification
              {sortedNotifications.length !== 1 ? "s" : ""}
              {(typeFilter !== "all" || priorityFilter !== "all" || readFilter !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setTypeFilter("all");
                    setPriorityFilter("all");
                    setReadFilter("all");
                    setSearchQuery("");
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium underline touch-manipulation"
                >
                  Clear filters
                </button>
              )}
            </div>
            {selectedNotifications.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-600">
                  {selectedNotifications.size} selected
                </span>
                <button
                  onClick={handleDeleteAllRead}
                  disabled={actionLoading === "delete-all-read"}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {actionLoading === "delete-all-read" ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {sortedNotifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No notifications found</p>
            <p className="text-gray-600 text-sm">
              {searchQuery || typeFilter !== "all" || priorityFilter !== "all" || readFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "No notifications have been created yet."}
            </p>
          </div>
        ) : (
          sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg border ${
                notification.isRead
                  ? "border-gray-200 bg-gray-50"
                  : "border-blue-200 bg-blue-50"
              } p-4 shadow-sm transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox for selection */}
                <input
                  type="checkbox"
                  checked={selectedNotifications.has(notification.id)}
                  onChange={() => toggleSelection(notification.id)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />

                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">{getTypeIcon(notification.type)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`text-base font-semibold ${
                            notification.isRead ? "text-gray-700" : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeColor(
                            notification.type
                          )}`}
                        >
                          {notification.type}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityBadgeColor(
                            notification.priority
                          )}`}
                        >
                          {notification.priority}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          notification.isRead ? "text-gray-600" : "text-gray-700"
                        } mb-2`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span>{formatDate(notification.createdAt)}</span>
                        {notification.relatedEntityType && notification.relatedEntityId && (
                          <span>
                            {notification.relatedEntityType}: {notification.relatedEntityId}
                          </span>
                        )}
                        {notification.recipientType && (
                          <span>To: {notification.recipientType}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View related item"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleToggleRead(notification.id, notification.isRead)}
                    disabled={actionLoading === notification.id}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title={notification.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {actionLoading === notification.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : notification.isRead ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(notification.id)}
                    disabled={actionLoading === notification.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete notification"
                  >
                    {actionLoading === notification.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
