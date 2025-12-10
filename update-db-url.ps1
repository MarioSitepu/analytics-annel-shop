# Script untuk update DATABASE_URL dengan Connection Pooling

Write-Host "🔧 Updating DATABASE_URL..." -ForegroundColor Cyan
Write-Host ""

$password = Read-Host "Masukkan password database Supabase (atau tekan Enter untuk skip)"

if ($password -and $password.Trim() -ne "") {
    $connectionString = "postgresql://postgres.yfomjrygtrohfrtrdvrr:$password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    
    $envContent = Get-Content .env -Raw
    $newContent = $envContent -replace 'DATABASE_URL="[^"]+"', "DATABASE_URL=`"$connectionString`""
    Set-Content -Path .env -Value $newContent -NoNewline
    
    Write-Host ""
    Write-Host "✅ DATABASE_URL updated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔍 Testing connection..." -ForegroundColor Cyan
    npx prisma db pull
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Connection successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📤 Pushing schema..." -ForegroundColor Cyan
        npx prisma db push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "🎉 Setup complete! Database ready." -ForegroundColor Green
        }
    } else {
        Write-Host ""
        Write-Host "❌ Connection failed. Check password." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "⚠️  No password provided." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Update manual di .env:" -ForegroundColor Cyan
    Write-Host 'DATABASE_URL="postgresql://postgres.yfomjrygtrohfrtrdvrr:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"' -ForegroundColor White
    Write-Host ""
    Write-Host "Ganti [PASSWORD] dengan password database Anda" -ForegroundColor Yellow
}

