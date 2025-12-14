# Cleanup script for Next.js dev server
# Kills processes on port 3000 and removes lock files

Write-Host "Cleaning up dev server resources..." -ForegroundColor Yellow

# Kill processes using port 3000
$port3000 = netstat -ano | findstr :3000 | Select-String "LISTENING"
if ($port3000) {
    $pids = $port3000 | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            $matches[1]
        }
    }
    
    foreach ($pid in $pids) {
        if ($pid) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "Killed process $pid on port 3000" -ForegroundColor Green
            } catch {
                Write-Host "Could not kill process $pid: $_" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "No processes found on port 3000" -ForegroundColor Green
}

# Remove Next.js lock file
$lockFile = ".next\dev\lock"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force
    Write-Host "Removed Next.js lock file" -ForegroundColor Green
} else {
    Write-Host "No lock file found" -ForegroundColor Green
}

# Wait a moment for ports to be released
Start-Sleep -Seconds 1

Write-Host "Cleanup complete!" -ForegroundColor Green
