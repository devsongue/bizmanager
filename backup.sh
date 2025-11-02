#!/bin/bash

# Backup BizManager Database

# Colors for output
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log_info() {
    echo -e "${BLUE}[BACKUP]${NC} $1"
}

# Create backup directory
BACKUP_DIR="/var/backups/bizmanager"
sudo mkdir -p $BACKUP_DIR
sudo chown $USER:$USER $BACKUP_DIR

# Timestamp for backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Database location
DB_PATH="/var/lib/bizmanager/bizmanager.db"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "[ERROR] Database file not found at $DB_PATH"
    exit 1
fi

# Create backup
log_info "Creating backup of database..."
cp "$DB_PATH" "$BACKUP_DIR/bizmanager_backup_$TIMESTAMP.db"

# Compress backup
log_info "Compressing backup..."
gzip "$BACKUP_DIR/bizmanager_backup_$TIMESTAMP.db"

# Remove backups older than 30 days
log_info "Cleaning up old backups..."
find $BACKUP_DIR -name "bizmanager_backup_*.db.gz" -mtime +30 -delete

log_info "Backup completed successfully!"
log_info "Backup location: $BACKUP_DIR/bizmanager_backup_$TIMESTAMP.db.gz"