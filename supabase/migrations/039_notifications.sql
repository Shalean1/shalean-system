-- Migration: Create notifications table
-- Created: 2025-01-XX
-- Description: Table for managing system notifications

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'booking', 'payment', 'system')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  recipient_type TEXT DEFAULT 'all' CHECK (recipient_type IN ('all', 'admin', 'cleaner', 'customer')),
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT,
  related_entity_type TEXT, -- e.g., 'booking', 'payment', 'application'
  related_entity_id TEXT, -- e.g., booking_reference, payment_reference
  action_url TEXT, -- URL to navigate when notification is clicked
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_type ON notifications(recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_email ON notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all notifications
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT
  USING (
    recipient_type = 'all' OR
    recipient_type = 'admin' OR
    (recipient_id IS NOT NULL AND recipient_id = auth.uid()) OR
    (recipient_email IS NOT NULL AND auth.jwt() ->> 'email' = recipient_email)
  );

-- Policy: Admins can insert notifications
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Admins can update notifications
DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;
CREATE POLICY "Admins can update notifications" ON notifications
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Admins can delete notifications
DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;
CREATE POLICY "Admins can delete notifications" ON notifications
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Policy: Users can mark their own notifications as read
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (
    (recipient_id IS NOT NULL AND recipient_id = auth.uid()) OR
    (recipient_email IS NOT NULL AND auth.jwt() ->> 'email' = recipient_email)
  )
  WITH CHECK (
    (recipient_id IS NOT NULL AND recipient_id = auth.uid()) OR
    (recipient_email IS NOT NULL AND auth.jwt() ->> 'email' = recipient_email)
  );

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set read_at when is_read is set to true
CREATE OR REPLACE FUNCTION set_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false AND NEW.read_at IS NULL THEN
    NEW.read_at = NOW();
  END IF;
  IF NEW.is_read = false THEN
    NEW.read_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set read_at timestamp
DROP TRIGGER IF EXISTS set_notification_read_at_trigger ON notifications;
CREATE TRIGGER set_notification_read_at_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION set_notification_read_at();
