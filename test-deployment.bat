@echo off
REM Test deployment script

echo Testing BizManager deployment...

REM Test if the application is running
echo Checking if application is accessible...
curl -f http://localhost:3000/api/health || echo Application not accessible on port 3000

echo Deployment test completed.