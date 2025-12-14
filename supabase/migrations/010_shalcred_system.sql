-- Migration: Create ShalCred credit system
-- Created: 2025-01-XX
-- Description: Tables and functions for credit purchase and management system

-- ============================================================================
-- USER CREDITS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0 NOT NULL CHECK (balance >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- ============================================================================
-- CREDIT TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('card', 'eft')),
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_payment_ref ON credit_transactions(payment_reference);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- ============================================================================
-- EFT PAYMENT SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS eft_payment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  reference_number TEXT NOT NULL,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eft_submissions_user_id ON eft_payment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_eft_submissions_status ON eft_payment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_eft_submissions_created_at ON eft_payment_submissions(created_at DESC);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE eft_payment_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: USER CREDITS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow system to insert credits for new users
DROP POLICY IF EXISTS "System can insert user credits" ON user_credits;
CREATE POLICY "System can insert user credits" ON user_credits
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: CREDIT TRANSACTIONS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create transactions" ON credit_transactions;
CREATE POLICY "System can create transactions" ON credit_transactions
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update transactions" ON credit_transactions;
CREATE POLICY "System can update transactions" ON credit_transactions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: EFT PAYMENT SUBMISSIONS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own EFT submissions" ON eft_payment_submissions;
CREATE POLICY "Users can view own EFT submissions" ON eft_payment_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own EFT submissions" ON eft_payment_submissions;
CREATE POLICY "Users can create own EFT submissions" ON eft_payment_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all EFT submissions (will be checked in application code)
DROP POLICY IF EXISTS "Admin can view all EFT submissions" ON eft_payment_submissions;
CREATE POLICY "Admin can view all EFT submissions" ON eft_payment_submissions
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can update EFT submissions" ON eft_payment_submissions;
CREATE POLICY "Admin can update EFT submissions" ON eft_payment_submissions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCTION: Initialize user credits on profile creation
-- ============================================================================
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create credits record when user is created
DROP TRIGGER IF EXISTS on_user_created_init_credits ON auth.users;
CREATE TRIGGER on_user_created_init_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_credits();

-- ============================================================================
-- FUNCTION: Update credit balance atomically
-- ============================================================================
CREATE OR REPLACE FUNCTION update_credit_balance(
  p_user_id UUID,
  p_amount DECIMAL,
  p_transaction_type TEXT
)
RETURNS DECIMAL AS $$
DECLARE
  v_balance_before DECIMAL;
  v_balance_after DECIMAL;
BEGIN
  -- Get current balance
  SELECT COALESCE(balance, 0) INTO v_balance_before
  FROM user_credits
  WHERE user_id = p_user_id;

  -- Calculate new balance
  IF p_transaction_type = 'purchase' OR p_transaction_type = 'refund' THEN
    v_balance_after := v_balance_before + p_amount;
  ELSIF p_transaction_type = 'usage' THEN
    v_balance_after := v_balance_before - p_amount;
    -- Ensure balance doesn't go negative
    IF v_balance_after < 0 THEN
      RAISE EXCEPTION 'Insufficient credits. Current balance: %, Required: %', v_balance_before, p_amount;
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
  END IF;

  -- Update balance
  INSERT INTO user_credits (user_id, balance, updated_at)
  VALUES (p_user_id, v_balance_after, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    balance = v_balance_after,
    updated_at = NOW();

  RETURN v_balance_after;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Update updated_at timestamp (if not exists)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_transactions_updated_at ON credit_transactions;
CREATE TRIGGER update_credit_transactions_updated_at
  BEFORE UPDATE ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_eft_submissions_updated_at ON eft_payment_submissions;
CREATE TRIGGER update_eft_submissions_updated_at
  BEFORE UPDATE ON eft_payment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
