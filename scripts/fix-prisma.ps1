# Script untuk fix Prisma generate error di Windows
Write-Host "Fixing Prisma generate error..." -ForegroundColor Yellow

# Stop any Node processes that might be using the file
Write-Host "Checking for Node processes..." -ForegroundColor Cyan
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Where-Object {$_.Path -notlike "*Cursor*"}
if ($nodeProcesses) {
    Write-Host "Found Node processes. Please close them first." -ForegroundColor Red
    $nodeProcesses | Format-Table ProcessName, Id, Path
    Write-Host "Press any key after closing Node processes..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Remove problematic files
$prismaPath = "node_modules\.prisma"
if (Test-Path $prismaPath) {
    Write-Host "Removing .prisma folder..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force $prismaPath -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Try to generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
try {
    npx prisma generate
    Write-Host "✅ Prisma client generated successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "If error persists, try:" -ForegroundColor Yellow
    Write-Host "1. Close Cursor/VS Code completely" -ForegroundColor White
    Write-Host "2. Open PowerShell as Administrator" -ForegroundColor White
    Write-Host "3. Navigate to project directory" -ForegroundColor White
    Write-Host "4. Run: npx prisma generate" -ForegroundColor White
}

