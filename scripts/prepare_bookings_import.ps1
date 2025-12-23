# PowerShell script to prepare bookings_rows (1).sql for import
# This script modifies the INSERT statement to use the staging table

$InputFile = "C:\Users\27825\Downloads\bookings_rows (1).sql"
$OutputFile = "supabase\migrations\055_bookings_data_insert.sql"

Write-Host "Preparing bookings import..." -ForegroundColor Green

# Read the input file
Write-Host "Reading input file: $InputFile" -ForegroundColor Yellow
$content = Get-Content -Path $InputFile -Raw

# Replace INSERT INTO statement (using simple string replace)
Write-Host "Modifying INSERT statement..." -ForegroundColor Yellow
$content = $content.Replace('INSERT INTO "public"."bookings"', 'INSERT INTO bookings_staging')

# Write to output file
Write-Host "Writing to output file: $OutputFile" -ForegroundColor Yellow
$content | Out-File -FilePath $OutputFile -Encoding UTF8 -NoNewline

Write-Host "Done! The modified INSERT statement is in: $OutputFile" -ForegroundColor Green
Write-Host ""
Write-Host "File size: $((Get-Item $OutputFile).Length / 1MB) MB" -ForegroundColor Cyan
