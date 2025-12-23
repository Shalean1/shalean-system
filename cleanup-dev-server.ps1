# Cleanup script for Next.js dev server
# Usage: .\cleanup-dev-server.ps1

Write-Host "Cleaning up Next.js dev server..." -ForegroundColor Yellow

# Find processes using ports 3000 or 3001
$ports = @(3000, 3001)
$processesToKill = @()

foreach ($port in $ports) {
    $connections = netstat -ano | findstr ":$port" | findstr "LISTENING"
    if ($connections) {
        $connections | ForEach-Object {
            $parts = $_ -split '\s+'
            $processId = $parts[-1]
            if ($processId -and $processId -match '^\d+$') {
                $processesToKill += $processId
            }
        }
    }
}

# Kill processes
if ($processesToKill.Count -gt 0) {
    $uniquePids = $processesToKill | Select-Object -Unique
    foreach ($processId in $uniquePids) {
        try {
            $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($proc) {
                Stop-Process -Id $processId -Force
                Write-Host "[OK] Killed process $processId ($($proc.ProcessName))" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "[ERROR] Could not kill process $processId" -ForegroundColor Red
        }
    }
}
else {
    Write-Host "[OK] No processes found using ports 3000 or 3001" -ForegroundColor Green
}

# Remove lock file
$lockFile = ".next\dev\lock"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Removed lock file" -ForegroundColor Green
}
else {
    Write-Host "[OK] No lock file found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Cleanup complete! You can now run 'npm run dev'" -ForegroundColor Cyan













