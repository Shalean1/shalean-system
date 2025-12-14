-- Migration: Fix incorrect balance values in credit transactions
-- Created: 2025-01-XX
-- Description: Function to identify and optionally fix credit transactions with incorrect balance_before/balance_after values

-- ============================================================================
-- FUNCTION: Identify transactions with incorrect balance values
-- ============================================================================
-- This function identifies credit transactions where balance_before and balance_after
-- don't match the expected values based on the transaction amount and type
CREATE OR REPLACE FUNCTION identify_incorrect_balance_transactions()
RETURNS TABLE (
  transaction_id UUID,
  user_id UUID,
  transaction_type TEXT,
  amount DECIMAL(10, 2),
  balance_before DECIMAL(10, 2),
  balance_after DECIMAL(10, 2),
  expected_balance_before DECIMAL(10, 2),
  expected_balance_after DECIMAL(10, 2),
  issue_description TEXT
) AS $$
DECLARE
  v_transaction RECORD;
  v_prev_transaction RECORD;
  v_expected_before DECIMAL(10, 2);
  v_expected_after DECIMAL(10, 2);
  v_issue TEXT;
BEGIN
  -- Process transactions ordered by user and creation time
  FOR v_transaction IN
    SELECT 
      ct.id,
      ct.user_id,
      ct.transaction_type,
      ct.amount,
      ct.balance_before,
      ct.balance_after,
      ct.created_at
    FROM credit_transactions ct
    WHERE ct.status = 'completed'
    ORDER BY ct.user_id, ct.created_at ASC
  LOOP
    -- Get the previous transaction for this user (if any)
    SELECT * INTO v_prev_transaction
    FROM credit_transactions
    WHERE user_id = v_transaction.user_id
      AND created_at < v_transaction.created_at
      AND status = 'completed'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Calculate expected balance_before based on previous transaction
    IF v_prev_transaction IS NULL THEN
      -- First transaction - balance_before should be 0
      v_expected_before := 0;
    ELSE
      -- Use previous transaction's balance_after
      v_expected_before := v_prev_transaction.balance_after;
    END IF;
    
    -- Calculate expected balance_after based on transaction type
    IF v_transaction.transaction_type = 'purchase' OR v_transaction.transaction_type = 'refund' THEN
      v_expected_after := v_expected_before + v_transaction.amount;
    ELSIF v_transaction.transaction_type = 'usage' THEN
      v_expected_after := v_expected_before - v_transaction.amount;
    ELSE
      v_expected_after := v_transaction.balance_after;
    END IF;
    
    -- Check if values are incorrect
    v_issue := NULL;
    IF ABS(v_transaction.balance_before - v_expected_before) > 0.01 THEN
      v_issue := format('balance_before mismatch: expected %s, got %s', v_expected_before, v_transaction.balance_before);
    ELSIF ABS(v_transaction.balance_after - v_expected_after) > 0.01 THEN
      v_issue := format('balance_after mismatch: expected %s, got %s', v_expected_after, v_transaction.balance_after);
    END IF;
    
    IF v_issue IS NOT NULL THEN
      RETURN QUERY SELECT 
        v_transaction.id,
        v_transaction.user_id,
        v_transaction.transaction_type,
        v_transaction.amount,
        v_transaction.balance_before,
        v_transaction.balance_after,
        v_expected_before,
        v_expected_after,
        v_issue::TEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Recalculate balance values for a specific transaction
-- ============================================================================
-- This function recalculates balance_before and balance_after for a transaction
-- by looking at the previous transaction's balance_after
CREATE OR REPLACE FUNCTION recalculate_transaction_balance(p_transaction_id UUID)
RETURNS TABLE (
  transaction_id UUID,
  old_balance_before DECIMAL(10, 2),
  old_balance_after DECIMAL(10, 2),
  new_balance_before DECIMAL(10, 2),
  new_balance_after DECIMAL(10, 2),
  updated BOOLEAN
) AS $$
DECLARE
  v_transaction RECORD;
  v_prev_transaction RECORD;
  v_correct_balance_before DECIMAL(10, 2);
  v_correct_balance_after DECIMAL(10, 2);
BEGIN
  -- Get the transaction
  SELECT * INTO v_transaction
  FROM credit_transactions
  WHERE id = p_transaction_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::UUID,
      NULL::DECIMAL,
      NULL::DECIMAL,
      NULL::DECIMAL,
      NULL::DECIMAL,
      false;
    RETURN;
  END IF;
  
  -- Get the previous transaction for this user (if any)
  SELECT * INTO v_prev_transaction
  FROM credit_transactions
  WHERE user_id = v_transaction.user_id
    AND created_at < v_transaction.created_at
    AND status = 'completed'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Calculate correct balance_before
  IF v_prev_transaction IS NULL THEN
    -- First transaction - balance_before should be 0
    v_correct_balance_before := 0;
  ELSE
    -- Use previous transaction's balance_after
    v_correct_balance_before := v_prev_transaction.balance_after;
  END IF;
  
  -- Calculate correct balance_after based on transaction type
  IF v_transaction.transaction_type = 'purchase' OR v_transaction.transaction_type = 'refund' THEN
    v_correct_balance_after := v_correct_balance_before + v_transaction.amount;
  ELSIF v_transaction.transaction_type = 'usage' THEN
    v_correct_balance_after := v_correct_balance_before - v_transaction.amount;
  ELSE
    v_correct_balance_after := v_transaction.balance_after;
  END IF;
  
  -- Update the transaction if values are different
  IF ABS(v_transaction.balance_before - v_correct_balance_before) > 0.01 OR
     ABS(v_transaction.balance_after - v_correct_balance_after) > 0.01 THEN
    UPDATE credit_transactions
    SET 
      balance_before = v_correct_balance_before,
      balance_after = v_correct_balance_after,
      updated_at = NOW()
    WHERE id = p_transaction_id;
    
    RETURN QUERY SELECT 
      v_transaction.id,
      v_transaction.balance_before,
      v_transaction.balance_after,
      v_correct_balance_before,
      v_correct_balance_after,
      true;
  ELSE
    RETURN QUERY SELECT 
      v_transaction.id,
      v_transaction.balance_before,
      v_transaction.balance_after,
      v_correct_balance_before,
      v_correct_balance_after,
      false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SIMPLE QUERY: Check for transactions with incorrect balance math
-- ============================================================================
-- Run this query directly to find transactions where balance_after doesn't match
-- balance_before +/- amount based on transaction type
-- This doesn't require the functions above to be created first

-- Example query to find purchase transactions with incorrect balance_after:
-- SELECT 
--   id,
--   user_id,
--   transaction_type,
--   amount,
--   balance_before,
--   balance_after,
--   (balance_before + amount) as expected_balance_after,
--   ABS(balance_after - (balance_before + amount)) as difference
-- FROM credit_transactions
-- WHERE transaction_type = 'purchase'
--   AND status = 'completed'
--   AND ABS(balance_after - (balance_before + amount)) > 0.01;

-- Example query to find usage transactions with incorrect balance_after:
-- SELECT 
--   id,
--   user_id,
--   transaction_type,
--   amount,
--   balance_before,
--   balance_after,
--   (balance_before - amount) as expected_balance_after,
--   ABS(balance_after - (balance_before - amount)) as difference
-- FROM credit_transactions
-- WHERE transaction_type = 'usage'
--   AND status = 'completed'
--   AND ABS(balance_after - (balance_before - amount)) > 0.01;

-- ============================================================================
-- USAGE: After applying this migration, you can use the functions:
--
-- 1. To identify transactions with incorrect balances:
--    SELECT * FROM identify_incorrect_balance_transactions();
--
-- 2. To fix a specific transaction:
--    SELECT * FROM recalculate_transaction_balance('transaction-id-here');
--
-- 3. To fix all transactions for a specific user (run in a transaction):
--    DO $$
--    DECLARE
--      v_tx RECORD;
--    BEGIN
--      FOR v_tx IN 
--        SELECT id FROM credit_transactions 
--        WHERE user_id = 'user-id-here' 
--        AND status = 'completed'
--        ORDER BY created_at ASC
--      LOOP
--        PERFORM recalculate_transaction_balance(v_tx.id);
--      END LOOP;
--    END $$;
-- ============================================================================
