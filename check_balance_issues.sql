-- Quick check for transactions with incorrect balance values
-- Run this query directly in Supabase SQL Editor

-- Find purchase transactions where balance_after doesn't equal balance_before + amount
SELECT 
  id,
  user_id,
  'purchase' as transaction_type,
  amount,
  balance_before,
  balance_after,
  (balance_before + amount) as expected_balance_after,
  ABS(balance_after - (balance_before + amount)) as difference,
  created_at
FROM credit_transactions
WHERE transaction_type = 'purchase'
  AND status = 'completed'
  AND ABS(balance_after - (balance_before + amount)) > 0.01
ORDER BY created_at DESC;

-- Find usage transactions where balance_after doesn't equal balance_before - amount
SELECT 
  id,
  user_id,
  'usage' as transaction_type,
  amount,
  balance_before,
  balance_after,
  (balance_before - amount) as expected_balance_after,
  ABS(balance_after - (balance_before - amount)) as difference,
  created_at
FROM credit_transactions
WHERE transaction_type = 'usage'
  AND status = 'completed'
  AND ABS(balance_after - (balance_before - amount)) > 0.01
ORDER BY created_at DESC;

-- Find the specific R100 purchase transaction mentioned
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
  created_at,
  CASE 
    WHEN transaction_type = 'purchase' THEN ABS(balance_after - (balance_before + amount))
    WHEN transaction_type = 'usage' THEN ABS(balance_after - (balance_before - amount))
    ELSE 0
  END as balance_mismatch
FROM credit_transactions
WHERE amount = 100.00
  AND transaction_type = 'purchase'
  AND status = 'completed'
ORDER BY created_at DESC
LIMIT 10;


