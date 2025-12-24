# PowerShell script to convert bookings_rows.csv to SQL INSERT statements
# This script converts CSV data to INSERT statements for the bookings_staging table

$InputFile = "C:\Users\27825\Downloads\bookings_rows.csv"
$OutputFile = "supabase\migrations\055_bookings_data_insert.sql"

Write-Host "Preparing bookings import from CSV..." -ForegroundColor Green

# Function to escape SQL strings
function Escape-SqlString {
    param([string]$value)
    
    if ($null -eq $value -or $value -eq '') {
        return 'NULL'
    }
    
    # Replace single quotes with two single quotes (SQL escaping)
    $escaped = $value.Replace("'", "''")
    
    # Return as SQL string literal
    return "'$escaped'"
}

# Function to escape JSON (for price_snapshot column)
function Escape-JsonForSql {
    param([string]$value)
    
    if ($null -eq $value -or $value -eq '') {
        return 'NULL'
    }
    
    # Replace single quotes with two single quotes
    $escaped = $value.Replace("'", "''")
    
    # Return as SQL JSONB literal
    return "'$escaped'::jsonb"
}

Write-Host "Reading CSV file: $InputFile" -ForegroundColor Yellow
$rows = Import-Csv -Path $InputFile

Write-Host "Found $($rows.Count) rows to process" -ForegroundColor Cyan

# Build the INSERT statement
$sql = "INSERT INTO bookings_staging (`n"
$sql += "  id,`n"
$sql += "  cleaner_id,`n"
$sql += "  booking_date,`n"
$sql += "  booking_time,`n"
$sql += "  service_type,`n"
$sql += "  customer_name,`n"
$sql += "  customer_email,`n"
$sql += "  customer_phone,`n"
$sql += "  address_line1,`n"
$sql += "  address_suburb,`n"
$sql += "  address_city,`n"
$sql += "  payment_reference,`n"
$sql += "  status,`n"
$sql += "  created_at,`n"
$sql += "  customer_id,`n"
$sql += "  total_amount,`n"
$sql += "  service_fee,`n"
$sql += "  frequency,`n"
$sql += "  frequency_discount,`n"
$sql += "  price_snapshot,`n"
$sql += "  cleaner_claimed_at,`n"
$sql += "  cleaner_started_at,`n"
$sql += "  cleaner_completed_at,`n"
$sql += "  customer_rating_id,`n"
$sql += "  cleaner_earnings,`n"
$sql += "  cleaner_accepted_at,`n"
$sql += "  cleaner_on_my_way_at,`n"
$sql += "  customer_reviewed,`n"
$sql += "  customer_review_id,`n"
$sql += "  recurring_schedule_id,`n"
$sql += "  requires_team,`n"
$sql += "  updated_at,`n"
$sql += "  tip_amount,`n"
$sql += "  cleaner_start_reminder_sent,`n"
$sql += "  unread_messages_count,`n"
$sql += "  notes`n"
$sql += ") VALUES`n"

$valueLines = @()
$rowCount = 0

foreach ($row in $rows) {
    $rowCount++
    if ($rowCount % 50 -eq 0) {
        Write-Host "  Processing row $rowCount of $($rows.Count)..." -ForegroundColor Gray
    }
    
    $values = @()
    
    # Handle each column, converting empty strings to NULL
    $values += if ($row.id) { Escape-SqlString $row.id } else { 'NULL' }
    $values += if ($row.cleaner_id) { Escape-SqlString $row.cleaner_id } else { 'NULL' }
    $values += if ($row.booking_date) { Escape-SqlString $row.booking_date } else { 'NULL' }
    $values += if ($row.booking_time) { Escape-SqlString $row.booking_time } else { 'NULL' }
    $values += if ($row.service_type) { Escape-SqlString $row.service_type } else { 'NULL' }
    $values += if ($row.customer_name) { Escape-SqlString $row.customer_name } else { 'NULL' }
    $values += if ($row.customer_email) { Escape-SqlString $row.customer_email } else { 'NULL' }
    $values += if ($row.customer_phone) { Escape-SqlString $row.customer_phone.Trim() } else { 'NULL' }
    $values += if ($row.address_line1) { Escape-SqlString $row.address_line1 } else { 'NULL' }
    $values += if ($row.address_suburb) { Escape-SqlString $row.address_suburb } else { 'NULL' }
    $values += if ($row.address_city) { Escape-SqlString $row.address_city } else { 'NULL' }
    $values += if ($row.payment_reference) { Escape-SqlString $row.payment_reference } else { 'NULL' }
    $values += if ($row.status) { Escape-SqlString $row.status } else { 'NULL' }
    
    # Handle timestamps - already in PostgreSQL format, just escape
    $values += if ($row.created_at -and $row.created_at.Trim() -ne '') {
        Escape-SqlString $row.created_at.Trim()
    } else {
        'NULL'
    }
    
    $values += if ($row.customer_id) { Escape-SqlString $row.customer_id } else { 'NULL' }
    $values += if ($row.total_amount) { Escape-SqlString $row.total_amount } else { 'NULL' }
    $values += if ($row.service_fee) { Escape-SqlString $row.service_fee } else { 'NULL' }
    $values += if ($row.frequency) { Escape-SqlString $row.frequency } else { 'NULL' }
    $values += if ($row.frequency_discount) { Escape-SqlString $row.frequency_discount } else { 'NULL' }
    
    # Handle price_snapshot as JSONB
    $values += if ($row.price_snapshot -and $row.price_snapshot.Trim() -ne '') {
        Escape-JsonForSql $row.price_snapshot
    } else {
        'NULL'
    }
    
    # Handle timestamp columns - already in PostgreSQL format, just escape
    $timestampColumns = @('cleaner_claimed_at', 'cleaner_started_at', 'cleaner_completed_at', 
                          'cleaner_accepted_at', 'cleaner_on_my_way_at', 'updated_at')
    
    foreach ($col in $timestampColumns) {
        $values += if ($row.$col -and $row.$col.Trim() -ne '') {
            Escape-SqlString $row.$col.Trim()
        } else {
            'NULL'
        }
    }
    
    # Handle remaining columns
    $values += if ($row.customer_rating_id) { Escape-SqlString $row.customer_rating_id } else { 'NULL' }
    $values += if ($row.cleaner_earnings) { Escape-SqlString $row.cleaner_earnings } else { 'NULL' }
    $values += if ($row.customer_reviewed) { Escape-SqlString $row.customer_reviewed } else { 'NULL' }
    $values += if ($row.customer_review_id) { Escape-SqlString $row.customer_review_id } else { 'NULL' }
    $values += if ($row.recurring_schedule_id) { Escape-SqlString $row.recurring_schedule_id } else { 'NULL' }
    $values += if ($row.requires_team) { Escape-SqlString $row.requires_team } else { 'NULL' }
    $values += if ($row.tip_amount) { Escape-SqlString $row.tip_amount } else { 'NULL' }
    $values += if ($row.cleaner_start_reminder_sent) { Escape-SqlString $row.cleaner_start_reminder_sent } else { 'NULL' }
    $values += if ($row.unread_messages_count) { Escape-SqlString $row.unread_messages_count } else { 'NULL' }
    $values += if ($row.notes) { Escape-SqlString $row.notes } else { 'NULL' }
    
    # Join values and add to value lines
    $valueLine = "  (" + ($values -join ', ') + ")"
    $valueLines += $valueLine
}

# Join all value lines with commas and newlines
$sql += $valueLines -join ",`n"
$sql += ";`n"

Write-Host "Writing SQL to: $OutputFile" -ForegroundColor Yellow
$sql | Out-File -FilePath $OutputFile -Encoding UTF8 -NoNewline

$fileSize = (Get-Item $OutputFile).Length / 1MB
Write-Host "`nDone! Generated SQL file with $rowCount rows" -ForegroundColor Green
Write-Host "File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
Write-Host "`nNext step: Run supabase\migrations\055_complete_import.sql in Supabase SQL Editor" -ForegroundColor Yellow

