#!/bin/bash

# Script untuk setup database

echo "🚀 Setting up database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "Please set DATABASE_URL in your .env file"
  exit 1
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

echo "✅ Database setup complete!"
echo "You can now start the application with: npm run dev"

