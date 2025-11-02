@echo off
echo Testing deployment workflow configuration...

echo Checking workflow files...
if exist ".github\workflows\ci-cd.yml" (
    echo ✓ CI/CD workflow file exists
) else (
    echo ✗ CI/CD workflow file missing
)

if exist ".github\workflows\deploy.yml" (
    echo ✓ Deploy workflow file exists
) else (
    echo ✗ Deploy workflow file missing
)

echo Checking configuration files...
if exist "ecosystem.config.js" (
    echo ✓ PM2 configuration file exists
) else (
    echo ✗ PM2 configuration file missing
)

if exist "Dockerfile" (
    echo ✓ Dockerfile exists
) else (
    echo ✗ Dockerfile missing
)

if exist "docker-compose.yml" (
    echo ✓ Docker Compose file exists
) else (
    echo ✗ Docker Compose file missing
)

echo Checking deployment scripts...
if exist "deploy.sh" (
    echo ✓ Deploy script exists
) else (
    echo ✗ Deploy script missing
)

echo Checking package.json scripts...
findstr /C:"build" package.json >nul
if %errorlevel% == 0 (
    echo ✓ Build script exists in package.json
) else (
    echo ✗ Build script missing in package.json
)

findstr /C:"start" package.json >nul
if %errorlevel% == 0 (
    echo ✓ Start script exists in package.json
) else (
    echo ✗ Start script missing in package.json
)

echo Deployment workflow validation complete.
pause