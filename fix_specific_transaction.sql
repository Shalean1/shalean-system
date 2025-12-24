-- Fix the specific R100 purchase transaction with incorrect balance_after
-- Transaction ID: 41a60b7a-17e9-43da-8a4c-d1f64bb67910

-- First, check the current state
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

-- Check the user's current balance
SELECT 
  user_id,
  balance
FROM user_credits
WHERE user_id = '74fd93d9-2559-44f0-bffd-59f7edad040f';

-- Fix the transaction balance_after value
UPDATE credit_transactions
SET 
  balance_after = balance_before + amount,
  updated_at = NOW()
WHERE id = '41a60b7a-17e9-43da-8a4c-d1f64bb67910'
  AND transaction_type = 'purchase';

-- Verify the fix
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

-- If using the recalculate function (after migration is applied):
-- SELECT * FROM recalculate_transaction_balance('41a60b7a-17e9-43da-8a4c-d1f64bb67910');

















