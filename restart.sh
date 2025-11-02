#!/bin/bash

# Restart BizManager Application

# Colors for output
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log_info() {
    echo -e "${YELLOW}[RESTART]${NC} $1"
}

# Restart the application
log_info "Restarting BizManager application..."
pm2 restart bizmanager

log_info "Application restarted successfully!"
log_info "Check status with: pm2 list"