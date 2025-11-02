#!/bin/bash

# Start BizManager Application

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Logging function
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing..."
    npm install -g pm2
fi

# Start the application
log_info "Starting BizManager application..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

log_info "Application started successfully!"
log_info "Check status with: pm2 list"
log_info "View logs with: pm2 logs bizmanager"