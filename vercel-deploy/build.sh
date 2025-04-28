#!/bin/bash
set -e

# Navigate to client directory
cd client

# Install dependencies
npm install

# Build the client
npm run build

# Check if build was successful
if [ ! -d "../dist" ]; then
  echo "Build failed: dist directory not found"
  exit 1
fi

echo "Build completed successfully!"