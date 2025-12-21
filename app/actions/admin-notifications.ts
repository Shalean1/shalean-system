"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "booking" | "payment" | "system";
  priority: "low" | "normal" | "high" | "urgent";
  isRead: boolean;
  recipientType: "all" | "admin" | "cleaner" | "customer";
  recipientId?: string;
  recipientEmail?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

/**
 * Map database record to Notification type
 */
function mapDatabaseToNotification(data: any): Notification {
  return {
    id: data.id,
    title: data.title,
    message: data.message,
    type: data.type,
    priority: data.priority,
    isRead: data.is_read,
    recipientType: data.recipient_type,
    recipientId: data.recipient_id,
    recipientEmail: data.recipient_email,
    relatedEntityType: data.related_entity_type,
    relatedEntityId: data.related_entity_id,
    actionUrl: data.action_url,
    metadata: data.metadata || {},
    createdAt: data.created_at,
    readAt: data.read_at,
    expiresAt: data.expires_at,
  };
}

/**
 * Get all notifications (admin access)
 */
export async function getAllNotifications(): Promise<Notification[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all notifications:", error);
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToNotification);
}

/**
 * Get notification statistics
 */
export async function getNotificationStats() {
  const supabase = createServiceRoleClient();
  
  const [totalResult, readResult, typeResult, priorityResult] = await Promise.all([
    // Total count
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true }),
    
    // Count by read status
    supabase
      .from("notifications")
      .select("is_read"),
    
    // Count by type
    supabase
      .from("notifications")
      .select("type"),
    
    // Count by priority
    supabase
      .from("notifications")
      .select("priority"),
  ]);

  // Count by read status
  const byReadStatus = {
    read: 0,
    unread: 0,
  };
  (readResult.data || []).forEach((notification) => {
    if (notification.is_read) {
      byReadStatus.read++;
    } else {
      byReadStatus.unread++;
    }
  });

  // Count by type
  const byType: Record<string, number> = {};
  (typeResult.data || []).forEach((notification) => {
    const type = notification.type || "unknown";
    byType[type] = (byType[type] || 0) + 1;
  });

  // Count by priority
  const byPriority: Record<string, number> = {};
  (priorityResult.data || []).forEach((notification) => {
    const priority = notification.priority || "normal";
    byPriority[priority] = (byPriority[priority] || 0) + 1;
  });

  return {
    total: totalResult.count || 0,
    byReadStatus,
    byType,
    byPriority,
  };
}

/**
 * Get notification by ID
 */
export async function getNotificationById(id: string): Promise<Notification | null> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch notification: ${error.message}`);
  }

  return data ? mapDatabaseToNotification(data) : null;
}

/**
 * Create a new notification
 */
export async function createNotification(
  notification: Omit<Notification, "id" | "createdAt" | "readAt">
): Promise<{ success: boolean; data?: Notification; error?: string }> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      is_read: notification.isRead,
      recipient_type: notification.recipientType,
      recipient_id: notification.recipientId || null,
      recipient_email: notification.recipientEmail || null,
      related_entity_type: notification.relatedEntityType || null,
      related_entity_id: notification.relatedEntityId || null,
      action_url: notification.actionUrl || null,
      metadata: notification.metadata || {},
      expires_at: notification.expiresAt || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: mapDatabaseToNotification(data) };
}

/**
 * Update a notification
 */
export async function updateNotification(
  id: string,
  updates: Partial<Omit<Notification, "id" | "createdAt">>
): Promise<{ success: boolean; data?: Notification; error?: string }> {
  const supabase = createServiceRoleClient();
  
  const updateData: any = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.message !== undefined) updateData.message = updates.message;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.isRead !== undefined) updateData.is_read = updates.isRead;
  if (updates.recipientType !== undefined) updateData.recipient_type = updates.recipientType;
  if (updates.recipientId !== undefined) updateData.recipient_id = updates.recipientId || null;
  if (updates.recipientEmail !== undefined) updateData.recipient_email = updates.recipientEmail || null;
  if (updates.relatedEntityType !== undefined) updateData.related_entity_type = updates.relatedEntityType || null;
  if (updates.relatedEntityId !== undefined) updateData.related_entity_id = updates.relatedEntityId || null;
  if (updates.actionUrl !== undefined) updateData.action_url = updates.actionUrl || null;
  if (updates.metadata !== undefined) updateData.metadata = updates.metadata || {};
  if (updates.expiresAt !== undefined) updateData.expires_at = updates.expiresAt || null;

  const { data, error } = await supabase
    .from("notifications")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating notification:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: mapDatabaseToNotification(data) };
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Mark notification as unread
 */
export async function markNotificationAsUnread(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: false, read_at: null })
    .eq("id", id);

  if (error) {
    console.error("Error marking notification as unread:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete multiple notifications
 */
export async function deleteNotifications(ids: string[]): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  
  const { error } = await supabase
    .from("notifications")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Error deleting notifications:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete all read notifications
 */
export async function deleteAllReadNotifications(): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("is_read", true);

  if (error) {
    console.error("Error deleting read notifications:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
