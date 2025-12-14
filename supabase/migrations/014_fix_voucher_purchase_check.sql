-- Migration: Fix voucher purchase check to allow purchasing after redemption
-- Created: 2025-01-XX
-- Description: Updates purchase_voucher function to only prevent purchase if user has an unredeemed voucher

-- ============================================================================
-- FIX: UPDATE purchase_voucher FUNCTION
-- ============================================================================
-- The previous check prevented users from purchasing vouchers if they had
-- ANY voucher record, even if it was already redeemed. This fix allows users
-- to purchase vouchers again after redeeming their previous purchase.
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
  -- FIX: Only prevent purchase if voucher is unredeemed
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
EXCEPTION
  WHEN OTHERS THEN
    -- Update pending purchase status to failed
    UPDATE pending_voucher_purchases
    SET status = 'failed', updated_at = NOW()
    WHERE id = v_pending_purchase.id;
    
    -- Return error
    RETURN QUERY SELECT false, format('Error assigning voucher: %s'::TEXT, SQLERRM), NULL::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
