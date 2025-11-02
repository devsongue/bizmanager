@echo off
REM Restart BizManager Application

echo [RESTART] Restarting BizManager application...

pm2 restart bizmanager

echo [RESTART] Application restarted successfully!
echo [INFO] Check status with: pm2 list