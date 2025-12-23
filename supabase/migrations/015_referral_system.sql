-- Migration: Create referral system
-- Created: 2025-01-XX
-- Description: Tables and functions for referral tracking and rewards

-- ============================================================================
-- REFERRALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  -- Track when referee signs up
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  -- Track when referee completes first booking
  first_booking_completed_at TIMESTAMPTZ,
  first_booking_reference TEXT,
  -- Track rewards given
  referrer_reward_given BOOLEAN DEFAULT false,
  referee_reward_given BOOLEAN DEFAULT false,
  referrer_reward_transaction_id UUID REFERENCES credit_transactions(id),
  referee_reward_transaction_id UUID REFERENCES credit_transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure one referral per referee
  UNIQUE(referee_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- ============================================================================
-- REFERRAL CODES TABLE (to map codes to users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS referral_codes (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: REFERRALS
-- ============================================================================
-- Users can view their own referrals (as referrer or referee)
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- System can create referrals
DROP POLICY IF EXISTS "System can create referrals" ON referrals;
CREATE POLICY "System can create referrals" ON referrals
  FOR INSERT
  WITH CHECK (true);

-- System can update referrals
DROP POLICY IF EXISTS "System can update referrals" ON referrals;
CREATE POLICY "System can update referrals" ON referrals
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: REFERRAL CODES
-- ============================================================================
-- Users can view their own referral code
DROP POLICY IF EXISTS "Users can view own referral code" ON referral_codes;
CREATE POLICY "Users can view own referral code" ON referral_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can create referral codes
DROP POLICY IF EXISTS "System can create referral codes" ON referral_codes;
CREATE POLICY "System can create referral codes" ON referral_codes
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own referral code
DROP POLICY IF EXISTS "Users can update own referral code" ON referral_codes;
CREATE POLICY "Users can update own referral code" ON referral_codes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTION: Generate or get referral code for user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_or_create_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Check if user already has a referral code
  SELECT code INTO v_code
  FROM referral_codes
  WHERE user_id = p_user_id;

  -- If code exists, return it
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  -- Generate new code from user ID
  -- Format: REF-XXXXXXXX (8 chars from user ID hash)
  v_code := 'REF-' || UPPER(SUBSTRING(REPLACE(p_user_id::TEXT, '-', ''), 1, 8));

  -- Ensure uniqueness by appending numbers if needed
  WHILE EXISTS (SELECT 1 FROM referral_codes WHERE code = v_code) LOOP
    v_code := 'REF-' || UPPER(SUBSTRING(REPLACE(p_user_id::TEXT, '-', ''), 1, 6)) || 
              LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END LOOP;

  -- Insert the code
  INSERT INTO referral_codes (user_id, code)
  VALUES (p_user_id, v_code)
  ON CONFLICT (user_id) DO UPDATE SET code = v_code;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Create referral relationship on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION create_referral_relationship(
  p_referee_id UUID,
  p_referral_code TEXT
)
RETURNS UUID AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_id UUID;
BEGIN
  -- Find referrer by referral code
  SELECT user_id INTO v_referrer_id
  FROM referral_codes
  WHERE code = p_referral_code;

  -- If referrer not found, return NULL (invalid referral code)
  IF v_referrer_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Prevent self-referral
  IF v_referrer_id = p_referee_id THEN
    RETURN NULL;
  END IF;

  -- Check if referee already has a referral relationship
  IF EXISTS (SELECT 1 FROM referrals WHERE referee_id = p_referee_id) THEN
    RETURN NULL;
  END IF;

  -- Create referral relationship
  INSERT INTO referrals (
    referrer_id,
    referee_id,
    referral_code,
    status,
    signed_up_at
  )
  VALUES (
    v_referrer_id,
    p_referee_id,
    p_referral_code,
    'pending',
    NOW()
  )
  RETURNING id INTO v_referral_id;

  RETURN v_referral_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Process referral rewards on first booking
-- ============================================================================
CREATE OR REPLACE FUNCTION process_referral_rewards(
  p_referee_id UUID,
  p_booking_reference TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_referral RECORD;
  v_referrer_reward_amount DECIMAL(10, 2) := 50.00;
  v_referee_reward_amount DECIMAL(10, 2) := 50.00;
  v_referrer_balance_before DECIMAL;
  v_referee_balance_before DECIMAL;
  v_referrer_balance_after DECIMAL;
  v_referee_balance_after DECIMAL;
  v_referrer_transaction_id UUID;
  v_referee_transaction_id UUID;
BEGIN
  -- Find active referral for this referee
  SELECT * INTO v_referral
  FROM referrals
  WHERE referee_id = p_referee_id
    AND status = 'pending'
  LIMIT 1;

  -- If no referral found, return success (not an error)
  IF v_referral IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'No referral found for this user'
    );
  END IF;

  -- Check if rewards already given
  IF v_referral.referrer_reward_given AND v_referral.referee_reward_given THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Rewards already given'
    );
  END IF;

  -- Get balances before
  SELECT COALESCE(balance, 0) INTO v_referrer_balance_before
  FROM user_credits
  WHERE user_id = v_referral.referrer_id;

  SELECT COALESCE(balance, 0) INTO v_referee_balance_before
  FROM user_credits
  WHERE user_id = p_referee_id;

  -- Give reward to referrer (if not already given)
  IF NOT v_referral.referrer_reward_given THEN
    -- Update referrer balance
    SELECT update_credit_balance(
      v_referral.referrer_id,
      v_referrer_reward_amount,
      'purchase'
    ) INTO v_referrer_balance_after;

    -- Create transaction record for referrer
    INSERT INTO credit_transactions (
      user_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      status,
      metadata
    )
    VALUES (
      v_referral.referrer_id,
      'purchase',
      v_referrer_reward_amount,
      v_referrer_balance_before,
      v_referrer_balance_after,
      'completed',
      jsonb_build_object(
        'type', 'referral_reward',
        'referral_id', v_referral.id,
        'referee_id', p_referee_id,
        'booking_reference', p_booking_reference
      )
    )
    RETURNING id INTO v_referrer_transaction_id;
  END IF;

  -- Give reward to referee (if not already given)
  IF NOT v_referral.referee_reward_given THEN
    -- Update referee balance
    SELECT update_credit_balance(
      p_referee_id,
      v_referee_reward_amount,
      'purchase'
    ) INTO v_referee_balance_after;

    -- Create transaction record for referee
    INSERT INTO credit_transactions (
      user_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      status,
      metadata
    )
    VALUES (
      p_referee_id,
      'purchase',
      v_referee_reward_amount,
      v_referee_balance_before,
      v_referee_balance_after,
      'completed',
      jsonb_build_object(
        'type', 'referral_reward',
        'referral_id', v_referral.id,
        'referrer_id', v_referral.referrer_id,
        'booking_reference', p_booking_reference
      )
    )
    RETURNING id INTO v_referee_transaction_id;
  END IF;

  -- Update referral record
  UPDATE referrals
  SET
    status = 'completed',
    first_booking_completed_at = NOW(),
    first_booking_reference = p_booking_reference,
    referrer_reward_given = true,
    referee_reward_given = true,
    referrer_reward_transaction_id = COALESCE(v_referrer_transaction_id, referrer_reward_transaction_id),
    referee_reward_transaction_id = COALESCE(v_referee_transaction_id, referee_reward_transaction_id),
    updated_at = NOW()
  WHERE id = v_referral.id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Referral rewards processed successfully',
    'referrer_reward', v_referrer_reward_amount,
    'referee_reward', v_referee_reward_amount,
    'referral_id', v_referral.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Check if user has completed first booking
-- ============================================================================
CREATE OR REPLACE FUNCTION is_first_booking(p_user_id UUID, p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_booking_count INTEGER;
BEGIN
  -- Count completed bookings for this user (by email or user_id if bookings table has user_id)
  -- Since bookings table uses contact_email, we check by email
  SELECT COUNT(*) INTO v_booking_count
  FROM bookings
  WHERE contact_email = p_email
    AND payment_status = 'completed'
    AND status IN ('confirmed', 'completed');

  RETURN v_booking_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================
DROP TRIGGER IF EXISTS update_referrals_updated_at ON referrals;
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_referral_codes_updated_at ON referral_codes;
CREATE TRIGGER update_referral_codes_updated_at
  BEFORE UPDATE ON referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER: Create referral code when user signs up
-- ============================================================================
CREATE OR REPLACE FUNCTION initialize_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate referral code for new user
  PERFORM get_or_create_referral_code(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_init_referral_code ON auth.users;
CREATE TRIGGER on_user_created_init_referral_code
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_referral_code();













