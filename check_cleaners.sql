-- Check all cleaners in the database
-- This will help identify the correct cleaner_id for Beaul/Beaulla Chemugarira

SELECT 
  cleaner_id,
  name,
  is_active,
  is_available,
  display_order,
  total_jobs,
  rating
FROM cleaners
ORDER BY display_order;

-- Check if there's a cleaner with a name similar to "Beaul" or "Beaulla"
SELECT 
  cleaner_id,
  name,
  is_active,
  is_available
FROM cleaners
WHERE LOWER(name) LIKE '%beaul%' 
   OR LOWER(name) LIKE '%beaulla%'
   OR LOWER(cleaner_id) LIKE '%beaul%';
