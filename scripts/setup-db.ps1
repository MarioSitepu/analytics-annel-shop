# Script untuk setup database (PowerShell)

Write-Host "🚀 Setting up database..." -ForegroundColor Cyan

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL environment variable is not set" -ForegroundColor Red
    Write-Host "Please set DATABASE_URL in your .env file" -ForegroundColor Yellow
    exit 1
}

# Generate Prisma Client
Write-Host "📦 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name init

Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host "You can now start the application with: npm run dev" -ForegroundColor Green

