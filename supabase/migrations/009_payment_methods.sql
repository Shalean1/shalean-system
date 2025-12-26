-- Migration: Create payment methods system
-- Created: 2025-01-XX
-- Description: Table for storing user payment methods

-- ============================================================================
-- PAYMENT METHODS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Payment method type: card, bank_account, etc.
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'other')),
  -- Display name for the payment method
  name TEXT NOT NULL,
  -- Last 4 digits of card or account number
  last_four TEXT,
  -- Card brand (visa, mastercard, etc.) or bank name
  brand TEXT,
  -- Expiry date for cards (MM/YY format)
  expiry_date TEXT,
  -- Whether this is the default payment method
  is_default BOOLEAN DEFAULT false,
  -- Additional metadata stored as JSONB
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Whether this payment method is active
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = true;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can insert own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can delete own payment methods" ON payment_methods;

-- Policy: Users can view their own payment methods
CREATE POLICY "Users can view own payment methods" ON payment_methods
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own payment methods
CREATE POLICY "Users can insert own payment methods" ON payment_methods
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own payment methods
CREATE POLICY "Users can update own payment methods" ON payment_methods
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own payment methods
CREATE POLICY "Users can delete own payment methods" ON payment_methods
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTION: Ensure only one default payment method per user
-- ============================================================================
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a payment method as default, unset all other defaults for this user
  IF NEW.is_default = true THEN
    UPDATE payment_methods
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to ensure only one default payment method
DROP TRIGGER IF EXISTS trigger_ensure_single_default_payment_method ON payment_methods;
CREATE TRIGGER trigger_ensure_single_default_payment_method
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_payment_method();

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
























