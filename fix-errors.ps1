# Script untuk fix common errors

Write-Host "🔧 Fixing common errors..." -ForegroundColor Cyan
Write-Host ""

# Stop Node processes
Write-Host "⏹️  Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Clean Prisma cache
Write-Host "🧹 Cleaning Prisma cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# Clean Next.js cache
Write-Host "🧹 Cleaning Next.js cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Cache cleaned!" -ForegroundColor Green
Write-Host ""

# Generate Prisma Client
Write-Host "📦 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

Write-Host ""
Write-Host "🔍 Testing database connection..." -ForegroundColor Cyan
Write-Host "If connection fails, check:" -ForegroundColor Yellow
Write-Host "  1. Password di .env benar" -ForegroundColor Yellow
Write-Host "  2. Connection string format benar" -ForegroundColor Yellow
Write-Host "  3. Database di Supabase sudah aktif" -ForegroundColor Yellow
Write-Host ""

# Test connection
npx prisma db pull

Write-Host ""
Write-Host "✅ Done!" -ForegroundColor Green
Write-Host ""
Write-Host "If connection successful, run:" -ForegroundColor Cyan
Write-Host "  npx prisma db push" -ForegroundColor White

