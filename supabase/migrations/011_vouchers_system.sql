-- Migration: Create vouchers system
-- Created: 2025-01-XX
-- Description: Tables and functions for voucher management and redemption

-- ============================================================================
-- VOUCHERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  voucher_type TEXT NOT NULL CHECK (voucher_type IN ('credit', 'discount_percentage', 'discount_fixed')),
  value DECIMAL(10, 2) NOT NULL,
  -- For credit: amount of credits to add (e.g., 100.00 = R100 credits)
  -- For discount_percentage: percentage discount (e.g., 15.00 = 15%)
  -- For discount_fixed: fixed amount discount (e.g., 50.00 = R50 off)
  minimum_order_amount DECIMAL(10, 2) DEFAULT 0, -- Only applies to discount vouchers
  maximum_discount_amount DECIMAL(10, 2) NULL, -- Only applies to percentage discounts
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NULL,
  is_active BOOLEAN DEFAULT true,
  purchase_price DECIMAL(10, 2) NULL, -- NULL = not purchasable, otherwise price in ZAR
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_valid_dates ON vouchers(valid_from, valid_until);

-- Add purchase_price column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vouchers' AND column_name = 'purchase_price'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN purchase_price DECIMAL(10, 2) NULL;
  END IF;
END $$;

-- ============================================================================
-- USER VOUCHERS TABLE (Assigns vouchers to users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_at TIMESTAMPTZ NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, voucher_id)
);

CREATE INDEX IF NOT EXISTS idx_user_vouchers_user_id ON user_vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_voucher_id ON user_vouchers(voucher_id);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_redeemed ON user_vouchers(is_redeemed);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_user_redeemed ON user_vouchers(user_id, is_redeemed);

-- ============================================================================
-- PENDING VOUCHER PURCHASES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pending_voucher_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  payment_reference TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_voucher_purchases_user_id ON pending_voucher_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_voucher_purchases_voucher_id ON pending_voucher_purchases(voucher_id);
CREATE INDEX IF NOT EXISTS idx_pending_voucher_purchases_payment_ref ON pending_voucher_purchases(payment_reference);
CREATE INDEX IF NOT EXISTS idx_pending_voucher_purchases_status ON pending_voucher_purchases(status);

-- ============================================================================
-- VOUCHER USAGE HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS voucher_usage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_voucher_id UUID NOT NULL REFERENCES user_vouchers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  voucher_code TEXT NOT NULL,
  voucher_type TEXT NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  -- For credit vouchers: amount of credits added
  -- For discount vouchers: discount amount applied
  booking_reference TEXT,
  order_total DECIMAL(10, 2), -- Only for discount vouchers
  discount_amount DECIMAL(10, 2), -- Only for discount vouchers
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voucher_usage_user_id ON voucher_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_voucher_id ON voucher_usage_history(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_user_voucher_id ON voucher_usage_history(user_voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_booking_ref ON voucher_usage_history(booking_reference);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_redeemed_at ON voucher_usage_history(redeemed_at DESC);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_voucher_purchases ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: VOUCHERS
-- ============================================================================
-- Anyone can view active vouchers (for validation)
DROP POLICY IF EXISTS "Anyone can view active vouchers" ON vouchers;
CREATE POLICY "Anyone can view active vouchers" ON vouchers
  FOR SELECT USING (is_active = true);

-- Authenticated users can view all vouchers
DROP POLICY IF EXISTS "Authenticated users can view vouchers" ON vouchers;
CREATE POLICY "Authenticated users can view vouchers" ON vouchers
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- RLS POLICIES: USER VOUCHERS
-- ============================================================================
-- Users can view their own vouchers
DROP POLICY IF EXISTS "Users can view own vouchers" ON user_vouchers;
CREATE POLICY "Users can view own vouchers" ON user_vouchers
  FOR SELECT USING (auth.uid() = user_id);

-- System can assign vouchers to users
DROP POLICY IF EXISTS "System can assign vouchers" ON user_vouchers;
CREATE POLICY "System can assign vouchers" ON user_vouchers
  FOR INSERT WITH CHECK (true);

-- Users can update their own vouchers (for redemption)
DROP POLICY IF EXISTS "Users can update own vouchers" ON user_vouchers;
CREATE POLICY "Users can update own vouchers" ON user_vouchers
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: VOUCHER USAGE HISTORY
-- ============================================================================
-- Users can view their own voucher usage history
DROP POLICY IF EXISTS "Users can view own voucher usage history" ON voucher_usage_history;
CREATE POLICY "Users can view own voucher usage history" ON voucher_usage_history
  FOR SELECT USING (auth.uid() = user_id);

-- System can record voucher usage
DROP POLICY IF EXISTS "System can record voucher usage" ON voucher_usage_history;
CREATE POLICY "System can record voucher usage" ON voucher_usage_history
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: PENDING VOUCHER PURCHASES
-- ============================================================================
-- Users can view their own pending purchases
DROP POLICY IF EXISTS "Users can view own pending purchases" ON pending_voucher_purchases;
CREATE POLICY "Users can view own pending purchases" ON pending_voucher_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own pending purchases
DROP POLICY IF EXISTS "Users can create own pending purchases" ON pending_voucher_purchases;
CREATE POLICY "Users can create own pending purchases" ON pending_voucher_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- System can update pending purchases
DROP POLICY IF EXISTS "System can update pending purchases" ON pending_voucher_purchases;
CREATE POLICY "System can update pending purchases" ON pending_voucher_purchases
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS update_vouchers_updated_at ON vouchers;
CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON vouchers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pending_voucher_purchases_updated_at ON pending_voucher_purchases;
CREATE TRIGGER update_pending_voucher_purchases_updated_at
  BEFORE UPDATE ON pending_voucher_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: REDEEM CREDIT VOUCHER
-- ============================================================================
CREATE OR REPLACE FUNCTION redeem_credit_voucher(
  p_user_id UUID,
  p_voucher_code TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  credit_amount DECIMAL(10, 2)
) AS $$
DECLARE
  v_voucher vouchers%ROWTYPE;
  v_user_voucher user_vouchers%ROWTYPE;
  v_credit_amount DECIMAL(10, 2);
BEGIN
  -- Find the voucher
  SELECT * INTO v_voucher
  FROM vouchers
  WHERE UPPER(code) = UPPER(p_voucher_code)
    AND is_active = true
    AND voucher_type = 'credit'
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND valid_from <= NOW();

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid or expired voucher code'::TEXT, 0::DECIMAL;
    RETURN;
  END IF;

  -- Find user's voucher assignment
  SELECT * INTO v_user_voucher
  FROM user_vouchers
  WHERE user_id = p_user_id
    AND voucher_id = v_voucher.id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Voucher not assigned to your account'::TEXT, 0::DECIMAL;
    RETURN;
  END IF;

  -- Check if already redeemed
  IF v_user_voucher.is_redeemed THEN
    RETURN QUERY SELECT false, 'This voucher has already been redeemed'::TEXT, 0::DECIMAL;
    RETURN;
  END IF;

  v_credit_amount := v_voucher.value;

  -- Mark voucher as redeemed
  UPDATE user_vouchers
  SET is_redeemed = true,
      redeemed_at = NOW()
  WHERE id = v_user_voucher.id;

  -- Add credits to user account
  PERFORM update_credit_balance(p_user_id, v_credit_amount, 'purchase');

  -- Record usage history
  INSERT INTO voucher_usage_history (
    user_voucher_id,
    user_id,
    voucher_id,
    voucher_code,
    voucher_type,
    value
  ) VALUES (
    v_user_voucher.id,
    p_user_id,
    v_voucher.id,
    v_voucher.code,
    v_voucher.voucher_type,
    v_credit_amount
  );

  RETURN QUERY SELECT true, format('Successfully redeemed voucher for R%s credits'::TEXT, v_credit_amount), v_credit_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: VALIDATE DISCOUNT VOUCHER
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_discount_voucher(
  p_user_id UUID,
  p_voucher_code TEXT,
  p_order_total DECIMAL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_amount DECIMAL(10, 2),
  voucher_type TEXT,
  voucher_value DECIMAL(10, 2),
  message TEXT
) AS $$
DECLARE
  v_voucher vouchers%ROWTYPE;
  v_user_voucher user_vouchers%ROWTYPE;
  v_calculated_discount DECIMAL(10, 2);
BEGIN
  -- Find the voucher
  SELECT * INTO v_voucher
  FROM vouchers
  WHERE UPPER(code) = UPPER(p_voucher_code)
    AND is_active = true
    AND voucher_type IN ('discount_percentage', 'discount_fixed')
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND valid_from <= NOW();

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::DECIMAL, NULL::TEXT, NULL::DECIMAL, 'Invalid or expired voucher code'::TEXT;
    RETURN;
  END IF;

  -- Find user's voucher assignment
  SELECT * INTO v_user_voucher
  FROM user_vouchers
  WHERE user_id = p_user_id
    AND voucher_id = v_voucher.id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::DECIMAL, NULL::TEXT, NULL::DECIMAL, 'Voucher not assigned to your account'::TEXT;
    RETURN;
  END IF;

  -- Check if already redeemed
  IF v_user_voucher.is_redeemed THEN
    RETURN QUERY SELECT false, 0::DECIMAL, NULL::TEXT, NULL::DECIMAL, 'This voucher has already been redeemed'::TEXT;
    RETURN;
  END IF;

  -- Check minimum order amount
  IF p_order_total < v_voucher.minimum_order_amount THEN
    RETURN QUERY SELECT false, 0::DECIMAL, NULL::TEXT, NULL::DECIMAL, 
      format('Minimum order amount of R%s required'::TEXT, v_voucher.minimum_order_amount);
    RETURN;
  END IF;

  -- Calculate discount amount
  IF v_voucher.voucher_type = 'discount_percentage' THEN
    v_calculated_discount := (p_order_total * v_voucher.value / 100);
    -- Apply maximum discount cap if set
    IF v_voucher.maximum_discount_amount IS NOT NULL AND v_calculated_discount > v_voucher.maximum_discount_amount THEN
      v_calculated_discount := v_voucher.maximum_discount_amount;
    END IF;
  ELSE
    -- Fixed amount discount
    v_calculated_discount := LEAST(v_voucher.value, p_order_total);
  END IF;

  -- Return success
  RETURN QUERY SELECT true, v_calculated_discount, v_voucher.voucher_type, v_voucher.value, 'Voucher is valid'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: RECORD DISCOUNT VOUCHER USAGE
-- ============================================================================
CREATE OR REPLACE FUNCTION record_discount_voucher_usage(
  p_user_id UUID,
  p_voucher_code TEXT,
  p_booking_reference TEXT,
  p_discount_amount DECIMAL,
  p_order_total DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_voucher vouchers%ROWTYPE;
  v_user_voucher user_vouchers%ROWTYPE;
BEGIN
  -- Get voucher
  SELECT * INTO v_voucher
  FROM vouchers
  WHERE UPPER(code) = UPPER(p_voucher_code);

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get user voucher assignment
  SELECT * INTO v_user_voucher
  FROM user_vouchers
  WHERE user_id = p_user_id
    AND voucher_id = v_voucher.id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Mark voucher as redeemed
  UPDATE user_vouchers
  SET is_redeemed = true,
      redeemed_at = NOW()
  WHERE id = v_user_voucher.id;

  -- Record usage history
  INSERT INTO voucher_usage_history (
    user_voucher_id,
    user_id,
    voucher_id,
    voucher_code,
    voucher_type,
    value,
    booking_reference,
    order_total,
    discount_amount
  ) VALUES (
    v_user_voucher.id,
    p_user_id,
    v_voucher.id,
    v_voucher.code,
    v_voucher.voucher_type,
    v_voucher.value,
    p_booking_reference,
    p_order_total,
    p_discount_amount
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: ASSIGN VOUCHER TO USER
-- ============================================================================
CREATE OR REPLACE FUNCTION assign_voucher_to_user(
  p_user_id UUID,
  p_voucher_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_voucher_id UUID;
BEGIN
  -- Get voucher ID
  SELECT id INTO v_voucher_id
  FROM vouchers
  WHERE UPPER(code) = UPPER(p_voucher_code)
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Assign voucher to user (ignore if already assigned)
  INSERT INTO user_vouchers (user_id, voucher_id)
  VALUES (p_user_id, v_voucher_id)
  ON CONFLICT (user_id, voucher_id) DO NOTHING;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: PURCHASE VOUCHER
-- ============================================================================
CREATE OR REPLACE FUNCTION purchase_voucher(
  p_user_id UUID,
  p_voucher_id UUID,
  p_payment_reference TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  user_voucher_id UUID
) AS $$
DECLARE
  v_voucher vouchers%ROWTYPE;
  v_user_voucher_id UUID;
  v_pending_purchase pending_voucher_purchases%ROWTYPE;
BEGIN
  -- Find the pending purchase
  SELECT * INTO v_pending_purchase
  FROM pending_voucher_purchases
  WHERE payment_reference = p_payment_reference
    AND user_id = p_user_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Pending purchase not found or already processed'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Verify voucher matches
  IF v_pending_purchase.voucher_id != p_voucher_id THEN
    RETURN QUERY SELECT false, 'Voucher ID mismatch'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Find the voucher
  SELECT * INTO v_voucher
  FROM vouchers
  WHERE id = p_voucher_id
    AND is_active = true
    AND purchase_price IS NOT NULL
    AND purchase_price > 0
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND valid_from <= NOW();

  IF NOT FOUND THEN
    -- Update pending purchase status
    UPDATE pending_voucher_purchases
    SET status = 'failed', updated_at = NOW()
    WHERE id = v_pending_purchase.id;
    
    RETURN QUERY SELECT false, 'Voucher not available for purchase'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check if user already has an unredeemed voucher of this type
  SELECT id INTO v_user_voucher_id
  FROM user_vouchers
  WHERE user_id = p_user_id
    AND voucher_id = p_voucher_id
    AND is_redeemed = false;

  IF FOUND THEN
    -- Update pending purchase status
    UPDATE pending_voucher_purchases
    SET status = 'failed', updated_at = NOW()
    WHERE id = v_pending_purchase.id;
    
    RETURN QUERY SELECT false, 'You already have an unredeemed voucher of this type. Please redeem it before purchasing another.'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Assign voucher to user
  -- Use INSERT ... ON CONFLICT to handle case where user previously had this voucher (even if redeemed)
  -- If a redeemed voucher exists, reset it to unredeemed status for the new purchase
  INSERT INTO user_vouchers (user_id, voucher_id, is_redeemed, redeemed_at, assigned_at)
  VALUES (p_user_id, p_voucher_id, false, NULL, NOW())
  ON CONFLICT (user_id, voucher_id) 
  DO UPDATE SET
    is_redeemed = false,
    redeemed_at = NULL,
    assigned_at = NOW()
  RETURNING id INTO v_user_voucher_id;

  -- Update pending purchase status
  UPDATE pending_voucher_purchases
  SET status = 'completed', updated_at = NOW()
  WHERE id = v_pending_purchase.id;

  RETURN QUERY SELECT true, format('Successfully purchased voucher: %s'::TEXT, v_voucher.title), v_user_voucher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: GET PURCHASABLE VOUCHERS
-- ============================================================================
CREATE OR REPLACE FUNCTION get_purchasable_vouchers()
RETURNS TABLE (
  id UUID,
  code TEXT,
  title TEXT,
  description TEXT,
  voucher_type TEXT,
  value DECIMAL(10, 2),
  minimum_order_amount DECIMAL(10, 2),
  maximum_discount_amount DECIMAL(10, 2),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  purchase_price DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.code,
    v.title,
    v.description,
    v.voucher_type,
    v.value,
    v.minimum_order_amount,
    v.maximum_discount_amount,
    v.valid_from,
    v.valid_until,
    v.purchase_price
  FROM vouchers v
  WHERE v.is_active = true
    AND v.purchase_price IS NOT NULL
    AND v.purchase_price > 0
    AND (v.valid_until IS NULL OR v.valid_until >= NOW())
    AND v.valid_from <= NOW()
  ORDER BY v.purchase_price ASC, v.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INSERT SAMPLE VOUCHERS (for testing)
-- ============================================================================
INSERT INTO vouchers (code, title, description, voucher_type, value, minimum_order_amount, valid_until, is_active, purchase_price) VALUES
  ('WELCOME100', 'Welcome Bonus', 'R100 credits for new users', 'credit', 100.00, 0, NULL, true, NULL),
  ('BIRTHDAY50', 'Birthday Special', 'R50 credits on your birthday', 'credit', 50.00, 0, NULL, true, NULL),
  ('REFERRAL25', 'Referral Reward', 'R25 credits for referring a friend', 'credit', 25.00, 0, NULL, true, NULL),
  ('DISCOUNT15', '15% Off Voucher', '15% discount on your next booking', 'discount_percentage', 15.00, 0, NULL, true, NULL),
  ('SAVE100', 'R100 Off Voucher', 'R100 off orders over R500', 'discount_fixed', 100.00, 500.00, NULL, true, NULL),
  ('PURCHASE50', 'R50 Credit Voucher', 'Purchase R50 worth of credits', 'credit', 50.00, 0, NULL, true, 45.00),
  ('PURCHASE100', 'R100 Credit Voucher', 'Purchase R100 worth of credits at a discount', 'credit', 100.00, 0, NULL, true, 90.00),
  ('PURCHASE200', 'R200 Credit Voucher', 'Purchase R200 worth of credits at a discount', 'credit', 200.00, 0, NULL, true, 180.00)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- NOTE: To assign vouchers to users, use the assign_voucher_to_user function
-- Example:
-- SELECT assign_voucher_to_user('user-uuid-here', 'WELCOME100');
-- 
-- Or insert directly:
-- INSERT INTO user_vouchers (user_id, voucher_id)
-- SELECT 'user-uuid-here', id FROM vouchers WHERE code = 'WELCOME100';
-- ============================================================================
