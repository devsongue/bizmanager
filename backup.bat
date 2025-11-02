@echo off
REM Backup BizManager Database

echo [BACKUP] Creating backup of database...

REM Create backup directory
set BACKUP_DIR=%USERPROFILE%\.bizmanager\backups
mkdir "%BACKUP_DIR%" >nul 2>&1

REM Timestamp for backup
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set TIMESTAMP=%dt:~0,8%_%dt:~8,6%

REM Database location
set DB_PATH=%USERPROFILE%\.bizmanager\bizmanager.db

REM Check if database exists
if not exist "%DB_PATH%" (
    echo [ERROR] Database file not found at %DB_PATH%
    exit /b 1
)

REM Create backup
echo [BACKUP] Creating backup of database...
copy "%DB_PATH%" "%BACKUP_DIR%\bizmanager_backup_%TIMESTAMP%.db"

echo [BACKUP] Backup completed successfully!
echo [BACKUP] Backup location: %BACKUP_DIR%\bizmanager_backup_%TIMESTAMP%.db