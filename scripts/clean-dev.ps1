# Script untuk membersihkan cache dan restart development server

Write-Host "🧹 Cleaning Next.js cache..." -ForegroundColor Cyan

# Stop all Node processes
Write-Host "⏹️  Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove .next folder
Write-Host "🗑️  Removing .next folder..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Remove node_modules/.cache if exists
if (Test-Path "node_modules\.cache") {
    Write-Host "🗑️  Removing node_modules/.cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
}

Write-Host "✅ Cache cleaned!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
Write-Host ""

# Start dev server
npm run dev

