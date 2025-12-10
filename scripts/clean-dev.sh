#!/bin/bash

# Script untuk membersihkan cache dan restart development server

echo "🧹 Cleaning Next.js cache..."

# Stop all Node processes (if any)
echo "⏹️  Stopping Node.js processes..."
pkill -f "next dev" || true

# Remove .next folder
echo "🗑️  Removing .next folder..."
rm -rf .next

# Remove node_modules/.cache if exists
if [ -d "node_modules/.cache" ]; then
    echo "🗑️  Removing node_modules/.cache..."
    rm -rf node_modules/.cache
fi

echo "✅ Cache cleaned!"
echo ""
echo "🚀 Starting development server..."
echo ""

# Start dev server
npm run dev

