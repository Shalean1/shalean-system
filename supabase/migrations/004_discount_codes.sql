-- Migration: Create discount codes system
-- Created: 2025-12-13
-- Description: Tables and functions for discount code management

-- ============================================================================
-- DISCOUNT CODES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  -- For percentage: 0-100 (e.g., 15.00 = 15%)
  -- For fixed: amount in ZAR (e.g., 50.00 = R50 off)
  minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
  maximum_discount_amount DECIMAL(10, 2) NULL, -- Only applies to percentage discounts
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NULL,
  usage_limit INTEGER NULL, -- NULL = unlimited uses
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid_dates ON discount_codes(valid_from, valid_until);

-- ============================================================================
-- DISCOUNT CODE USAGE TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  booking_reference TEXT,
  user_email TEXT,
  discount_amount DECIMAL(10, 2) NOT NULL,
  order_total DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_code_usage_code_id ON discount_code_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_booking_ref ON discount_code_usage(booking_reference);
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_email ON discount_code_usage(user_email);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Discount Codes: Anyone can view active codes (for validation)
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON discount_codes;
CREATE POLICY "Anyone can view active discount codes" ON discount_codes
  FOR SELECT USING (is_active = true);

-- Discount Codes: Authenticated users can manage codes
DROP POLICY IF EXISTS "Authenticated users can manage discount codes" ON discount_codes;
CREATE POLICY "Authenticated users can manage discount codes" ON discount_codes
  FOR ALL USING (auth.role() = 'authenticated');

-- Discount Code Usage: Anyone can insert (for tracking usage)
DROP POLICY IF EXISTS "Anyone can track discount code usage" ON discount_code_usage;
CREATE POLICY "Anyone can track discount code usage" ON discount_code_usage
  FOR INSERT WITH CHECK (true);

-- Discount Code Usage: Authenticated users can view all usage
DROP POLICY IF EXISTS "Authenticated users can view discount code usage" ON discount_code_usage;
CREATE POLICY "Authenticated users can view discount code usage" ON discount_code_usage
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS update_discount_codes_updated_at ON discount_codes;
CREATE TRIGGER update_discount_codes_updated_at
  BEFORE UPDATE ON discount_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: VALIDATE DISCOUNT CODE
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_order_total DECIMAL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_amount DECIMAL(10, 2),
  discount_type TEXT,
  discount_value DECIMAL(10, 2),
  message TEXT
) AS $$
DECLARE
  v_discount discount_codes%ROWTYPE;
  v_calculated_discount DECIMAL(10, 2);
BEGIN
  -- Find the discount code (case-insensitive)
  SELECT * INTO v_discount
  FROM discount_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND valid_from <= NOW();

  -- Code not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::DECIMAL, NULL::TEXT, NULL::DECIMAL, 'Invalid or expired discount code'::TEXT;
    RETURN;
  END IF;

  -- Check usage limit
  IF v_discount.usage_limit IS NOT NULL AND v_discount.usage_count >= v_discount.usage_limit THEN
    RETURN QUERY SELECT false, 0::DECIMAL, NULL::TEXT, NULL::DECIMAL, 'This discount code has reached its usage limit'::TEXT;
    RETURN;
  END IF;

  -- Check minimum order amount
  IF p_order_total < v_discount.minimum_order_amount THEN
    RETURN QUERY SELECT false, 0::DECIMAL, NULL::TEXT, NULL::DECIMAL, 
      format('Minimum order amount of R%s required', v_discount.minimum_order_amount)::TEXT;
    RETURN;
  END IF;

  -- Calculate discount amount
  IF v_discount.discount_type = 'percentage' THEN
    v_calculated_discount := (p_order_total * v_discount.discount_value / 100);
    -- Apply maximum discount cap if set
    IF v_discount.maximum_discount_amount IS NOT NULL AND v_calculated_discount > v_discount.maximum_discount_amount THEN
      v_calculated_discount := v_discount.maximum_discount_amount;
    END IF;
  ELSE
    -- Fixed amount discount
    v_calculated_discount := LEAST(v_discount.discount_value, p_order_total);
  END IF;

  -- Return success
  RETURN QUERY SELECT true, v_calculated_discount, v_discount.discount_type, v_discount.discount_value, 'Discount code applied successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: RECORD DISCOUNT CODE USAGE
-- ============================================================================
CREATE OR REPLACE FUNCTION record_discount_code_usage(
  p_code TEXT,
  p_booking_reference TEXT,
  p_user_email TEXT,
  p_discount_amount DECIMAL,
  p_order_total DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_discount_id UUID;
BEGIN
  -- Get discount code ID
  SELECT id INTO v_discount_id
  FROM discount_codes
  WHERE UPPER(code) = UPPER(p_code);

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Record usage
  INSERT INTO discount_code_usage (
    discount_code_id,
    booking_reference,
    user_email,
    discount_amount,
    order_total
  ) VALUES (
    v_discount_id,
    p_booking_reference,
    p_user_email,
    p_discount_amount,
    p_order_total
  );

  -- Increment usage count
  UPDATE discount_codes
  SET usage_count = usage_count + 1
  WHERE id = v_discount_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INSERT SAMPLE DISCOUNT CODES (for testing)
-- ============================================================================
INSERT INTO discount_codes (code, description, discount_type, discount_value, minimum_order_amount, valid_until, usage_limit, is_active) VALUES
  ('WELCOME10', 'Welcome discount - 10% off your first booking', 'percentage', 10.00, 0, NULL, NULL, true),
  ('SAVE50', 'Save R50 on orders over R300', 'fixed', 50.00, 300.00, NULL, 100, true),
  ('SUMMER15', 'Summer special - 15% off (max R100)', 'percentage', 15.00, 0, NOW() + INTERVAL '30 days', NULL, true)
ON CONFLICT (code) DO NOTHING;













