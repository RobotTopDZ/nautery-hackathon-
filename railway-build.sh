#!/bin/bash
set -e

echo "🚀 Starting Railway build process..."

# Clean any existing node_modules and lock files
echo "🧹 Cleaning existing dependencies..."
rm -rf node_modules
rm -f package-lock.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install --no-package-lock

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"
