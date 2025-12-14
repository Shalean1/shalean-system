-- Add index on payment_reference for faster lookups when checking for duplicate bookings
CREATE INDEX IF NOT EXISTS idx_bookings_payment_reference ON bookings(payment_reference);
