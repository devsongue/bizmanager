@echo off
REM Start BizManager Application

echo [INFO] Starting BizManager application...

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] PM2 is not installed. Installing...
    npm install -g pm2
)

REM Start the application
echo [INFO] Starting BizManager application...
pm2 start ecosystem.config.js

REM Save PM2 configuration
pm2 save

echo [INFO] Application started successfully!
echo [INFO] Check status with: pm2 list
echo [INFO] View logs with: pm2 logs bizmanager