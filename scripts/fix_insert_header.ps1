$header = @"
INSERT INTO bookings_staging (
  id,
  cleaner_id,
  booking_date,
  booking_time,
  service_type,
  customer_name,
  customer_email,
  customer_phone,
  address_line1,
  address_suburb,
  address_city,
  payment_reference,
  status,
  created_at,
  customer_id,
  total_amount,
  service_fee,
  frequency,
  frequency_discount,
  price_snapshot,
  cleaner_claimed_at,
  cleaner_started_at,
  cleaner_completed_at,
  customer_rating_id,
  cleaner_earnings,
  cleaner_accepted_at,
  cleaner_on_my_way_at,
  customer_reviewed,
  customer_review_id,
  recurring_schedule_id,
  requires_team,
  updated_at,
  tip_amount,
  cleaner_start_reminder_sent,
  unread_messages_count,
  notes
) VALUES
"@

$filePath = "supabase\migrations\055_bookings_data_insert.sql"
$content = Get-Content $filePath -Raw

# Check if header already exists
if (-not $content.StartsWith("INSERT INTO bookings_staging")) {
    Write-Host "Adding INSERT statement header..." -ForegroundColor Yellow
    $newContent = $header + $content
    $newContent | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
    Write-Host "Header added successfully!" -ForegroundColor Green
} else {
    Write-Host "Header already exists, skipping..." -ForegroundColor Cyan
}

