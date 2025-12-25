-- Comprehensive fix for the R100 purchase transaction issue
-- This script fixes both the transaction record AND ensures the user's balance is correct

-- Transaction details:
-- ID: 41a60b7a-17e9-43da-8a4c-d1f64bb67910
-- User ID: 74fd93d9-2559-44f0-bffd-59f7edad040f
-- Amount: R100.00

BEGIN;

-- Step 1: Check current state
SELECT 'Current Transaction State:' as info;
SELECT 
  id,
  user_id,
  transaction_type,
  amount,
  balance_before,
  balance_after,
  payment_method,
  payment_reference,
  status,
  created_at
FROM credit_transactions
WHERE id = '41a60b7a-17e9-43da-8a4c-d1f64bb67910';

SELECT 'Current User Balance:' as info;
SELECT 
  user_id,
  balance,
  updated_at
FROM user_credits
WHERE user_id = '74fd93d9-2559-44f0-bffd-59f7edad040f';

-- Step 2: Check if there are any transactions before this one
SELECT 'Previous Transactions:' as info;
SELECT 
  id,
  transaction_type,
  amount,
  balance_before,
  balance_after,
  created_at
FROM credit_transactions
WHERE user_id = '74fd93d9-2559-44f0-bffd-59f7edad040f'
  AND created_at < '2025-12-14 15:09:36.617297+00'
  AND status = 'completed'
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: Fix the transaction balance_after
-- Since balance_before is 0.00, balance_after should be 0.00 + 100.00 = 100.00
UPDATE credit_transactions
SET 
  balance_after = balance_before + amount,
  updated_at = NOW()
WHERE id = '41a60b7a-17e9-43da-8a4c-d1f64bb67910'
  AND transaction_type = 'purchase';

-- Step 4: Ensure user's balance is correct
-- Calculate the correct balance by summing all completed transactions
DO $$
DECLARE
  v_calculated_balance DECIMAL(10, 2);
BEGIN
  -- Calculate balance from all completed transactions
  SELECT COALESCE(SUM(CASE 
    WHEN transaction_type IN ('purchase', 'refund') THEN amount
    WHEN transaction_type = 'usage' THEN -amount
    ELSE 0
  END), 0) INTO v_calculated_balance
  FROM credit_transactions
  WHERE user_id = '74fd93d9-2559-44f0-bffd-59f7edad040f'
    AND status = 'completed';
  
  -- Update user balance
  INSERT INTO user_credits (user_id, balance, updated_at)
  VALUES ('74fd93d9-2559-44f0-bffd-59f7edad040f', v_calculated_balance, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    balance = v_calculated_balance,
    updated_at = NOW();
END $$;

-- Step 5: Verify the fix
SELECT 'Fixed Transaction State:' as info;
SELECT 
  id,
  user_id,
  transaction_type,
  amount,
  balance_before,
  balance_after,
  (balance_before + amount) as expected_balance_after,
  ABS(balance_after - (balance_before + amount)) as difference,
  updated_at
FROM credit_transactions
WHERE id = '41a60b7a-17e9-43da-8a4c-d1f64bb67910';

SELECT 'Fixed User Balance:' as info;
SELECT 
  user_id,
  balance,
  updated_at
FROM user_credits
WHERE user_id = '74fd93d9-2559-44f0-bffd-59f7edad040f';

COMMIT;

-- If you want to rollback instead, use:
-- ROLLBACK;























