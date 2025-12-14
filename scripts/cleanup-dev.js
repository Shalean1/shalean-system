#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up dev server resources...\n');

// Function to kill processes on a specific port (Windows)
function killProcessOnPort(port) {
  try {
    // Find processes using the port
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
    const lines = result.split('\n').filter(line => line.includes('LISTENING'));
    
    if (lines.length === 0) {
      console.log(`✅ No processes found on port ${port}`);
      return;
    }

    const pids = new Set();
    lines.forEach(line => {
      const match = line.match(/\s+(\d+)$/);
      if (match) {
        pids.add(match[1]);
      }
    });

    pids.forEach(pid => {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`✅ Killed process ${pid} on port ${port}`);
      } catch (error) {
        // Process might already be dead
        console.log(`⚠️  Could not kill process ${pid} (may already be terminated)`);
      }
    });
  } catch (error) {
    // No processes found or command failed
    console.log(`✅ No processes found on port ${port}`);
  }
}

// Remove Next.js lock file
const lockFile = path.join(process.cwd(), '.next', 'dev', 'lock');
if (fs.existsSync(lockFile)) {
  try {
    fs.unlinkSync(lockFile);
    console.log('✅ Removed Next.js lock file');
  } catch (error) {
    console.log(`⚠️  Could not remove lock file: ${error.message}`);
  }
} else {
  console.log('✅ No lock file found');
}

// Kill processes on port 3000
killProcessOnPort(3000);

// Wait a moment for ports to be released
setTimeout(() => {
  console.log('\n✨ Cleanup complete!\n');
}, 500);
