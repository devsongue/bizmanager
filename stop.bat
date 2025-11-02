@echo off
REM Stop BizManager Application

echo [STOP] Stopping BizManager application...

pm2 stop bizmanager

echo [STOP] Application stopped successfully!