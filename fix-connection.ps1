# Script untuk fix database connection

Write-Host "🔧 Fixing database connection..." -ForegroundColor Cyan
Write-Host ""

# Read current .env
$envContent = Get-Content .env -Raw
$currentDbUrl = ($envContent | Select-String 'DATABASE_URL="([^"]+)"').Matches.Groups[1].Value

Write-Host "Current DATABASE_URL format:" -ForegroundColor Yellow
Write-Host $currentDbUrl -ForegroundColor Gray
Write-Host ""

# Check if password has brackets
if ($currentDbUrl -match '\[.*\]') {
    Write-Host "⚠️  Found brackets in password, removing..." -ForegroundColor Yellow
    $currentDbUrl = $currentDbUrl -replace '\[', '' -replace '\]', ''
}

# Check if has pgbouncer params
if ($currentDbUrl -notmatch '\?') {
    Write-Host "⚠️  Adding connection parameters..." -ForegroundColor Yellow
    $currentDbUrl = $currentDbUrl + "?sslmode=require"
}

# Extract password
if ($currentDbUrl -match 'postgres://postgres:([^@]+)@') {
    $password = $matches[1]
    Write-Host "Password found: $($password.Substring(0, [Math]::Min(5, $password.Length)))..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "📝 Updated connection string:" -ForegroundColor Cyan
Write-Host "DATABASE_URL=`"$currentDbUrl`"" -ForegroundColor White
Write-Host ""

# Update .env
$newEnvContent = $envContent -replace 'DATABASE_URL="[^"]+"', "DATABASE_URL=`"$currentDbUrl`""
Set-Content -Path .env -Value $newEnvContent -NoNewline

Write-Host "✅ .env updated!" -ForegroundColor Green
Write-Host ""

# Try alternative: Connection Pooling
Write-Host "💡 Trying Connection Pooling (more reliable)..." -ForegroundColor Cyan
Write-Host ""
Write-Host "If direct connection fails, use Connection Pooling:" -ForegroundColor Yellow
Write-Host "1. Supabase Dashboard > Settings > Database > Connection Pooling" -ForegroundColor White
Write-Host "2. Copy Transaction mode connection string" -ForegroundColor White
Write-Host "3. Update DATABASE_URL in .env" -ForegroundColor White
Write-Host ""

# Test connection
Write-Host "🔍 Testing connection..." -ForegroundColor Cyan
npx prisma db pull

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Connection successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 Pushing schema to database..." -ForegroundColor Cyan
    npx prisma db push
} else {
    Write-Host ""
    Write-Host "❌ Connection failed. Try:" -ForegroundColor Red
    Write-Host "1. Check password in Supabase Dashboard" -ForegroundColor Yellow
    Write-Host "2. Use Connection Pooling instead" -ForegroundColor Yellow
    Write-Host "3. Check firewall/network settings" -ForegroundColor Yellow
}

