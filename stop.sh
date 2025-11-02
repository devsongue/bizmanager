#!/bin/bash

# Stop BizManager Application

# Colors for output
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging function
log_info() {
    echo -e "${RED}[STOP]${NC} $1"
}

# Stop the application
log_info "Stopping BizManager application..."
pm2 stop bizmanager

log_info "Application stopped successfully!"