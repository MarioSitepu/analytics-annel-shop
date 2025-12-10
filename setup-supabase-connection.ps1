# Script untuk setup Supabase Connection Pooling

Write-Host " Setting up Supabase Connection Pooling..." -ForegroundColor Cyan
Write-Host ""

Write-Host " INSTRUKSI:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Buka Supabase Dashboard:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Pilih project Anda" -ForegroundColor White
Write-Host ""
Write-Host "3. Settings > Database > Connection Pooling" -ForegroundColor White
Write-Host ""
Write-Host "4. Copy connection string dari Transaction mode" -ForegroundColor White
Write-Host "   Format: postgresql://postgres.xxxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Paste connection string di bawah ini:" -ForegroundColor White
Write-Host ""

$poolingUrl = Read-Host "Connection Pooling URL"

if ($null -ne $poolingUrl -and $poolingUrl.Trim() -ne "") {
    $envContent = Get-Content .env -Raw
    $newContent = $envContent -replace 'DATABASE_URL="[^"]+"', "DATABASE_URL=`"$poolingUrl`""
    Set-Content -Path .env -Value $newContent -NoNewline
    
    Write-Host ""
    Write-Host " .env updated!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host " Testing connection..." -ForegroundColor Cyan
    npx prisma db pull
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host " Connection successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host " Pushing schema..." -ForegroundColor Cyan
        npx prisma db push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host " Setup complete!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "  Schema push failed" -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host " Connection failed" -ForegroundColor Red
        Write-Host "Check password and connection string" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host " No connection string provided" -ForegroundColor Red
    Write-Host ""
    Write-Host "To update manually:" -ForegroundColor Yellow
    Write-Host "1. Edit .env file" -ForegroundColor White
    Write-Host "2. Update DATABASE_URL" -ForegroundColor White
    Write-Host "3. Run: npx prisma db pull" -ForegroundColor White
    Write-Host "4. Run: npx prisma db push" -ForegroundColor White
}
