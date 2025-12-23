-- Fix foreign key constraint on profiles.cleaner_id to allow cleaner deletion
-- When a cleaner is deleted, set profiles.cleaner_id to NULL instead of preventing deletion

-- Drop the existing foreign key constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_cleaner_id_fkey;

-- Recreate the foreign key constraint with ON DELETE SET NULL
ALTER TABLE profiles
ADD CONSTRAINT profiles_cleaner_id_fkey
FOREIGN KEY (cleaner_id)
REFERENCES cleaners(cleaner_id)
ON DELETE SET NULL;

