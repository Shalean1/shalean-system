-- Migration: Fix referral code lookup to be case-insensitive
-- Created: 2025-01-XX
-- Description: Update create_referral_relationship function to match referral codes case-insensitively
--              This ensures codes like "REF-74FD93D9" work regardless of case

-- ============================================================================
-- FUNCTION: Create referral relationship on signup (UPDATED)
-- ============================================================================
CREATE OR REPLACE FUNCTION create_referral_relationship(
  p_referee_id UUID,
  p_referral_code TEXT
)
RETURNS UUID AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_id UUID;
  v_actual_code TEXT;
BEGIN
  -- Find referrer by referral code (case-insensitive lookup)
  SELECT user_id, code INTO v_referrer_id, v_actual_code
  FROM referral_codes
  WHERE UPPER(code) = UPPER(TRIM(p_referral_code));

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
  -- Use the actual code from database (preserve original case)
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
    v_actual_code,  -- Use the actual code from database
    'pending',
    NOW()
  )
  RETURNING id INTO v_referral_id;

  RETURN v_referral_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;









