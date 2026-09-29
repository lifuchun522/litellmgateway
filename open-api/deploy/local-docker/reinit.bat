@echo off
setlocal

set SCRIPT_DIR=%~dp0
set COMPOSE_FILE=%SCRIPT_DIR%docker-compose.yaml

if "%POSTGRES_DATA_DIR%"=="" (
  set POSTGRES_DATA_DIR=D:\data\jd_openapi\postgres
)

echo [1/5] Stop containers and remove orphans...
docker compose -f "%COMPOSE_FILE%" down --remove-orphans
if errorlevel 1 goto :err

echo [2/5] Reset PostgreSQL data dir: %POSTGRES_DATA_DIR%
if exist "%POSTGRES_DATA_DIR%" (
  rmdir /s /q "%POSTGRES_DATA_DIR%"
)
mkdir "%POSTGRES_DATA_DIR%" >nul 2>nul

echo [3/5] Rebuild and start services...
docker compose -f "%COMPOSE_FILE%" up -d --build
if errorlevel 1 goto :err

echo [4/5] Restart app once to avoid startup race with PostgreSQL...
docker restart openapi-app >nul
if errorlevel 1 goto :err

echo [5/5] Wait for app ready and show service status...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$check={param([int]$sec) $deadline=(Get-Date).AddSeconds($sec); while((Get-Date)-lt $deadline){ try { $r=Invoke-WebRequest -Uri 'http://localhost:5656/login' -UseBasicParsing -TimeoutSec 5; if($r.StatusCode -eq 200){ return $true } } catch {}; Start-Sleep -Seconds 2 }; return $false }; if(-not (& $check 90)){ docker restart openapi-app | Out-Null }; if(-not (& $check 120)){ Write-Error 'openapi-app not ready within timeout'; exit 1 }"
if errorlevel 1 goto :err

docker compose -f "%COMPOSE_FILE%" ps
if errorlevel 1 goto :err

echo Done.
exit /b 0

:err
echo Failed. Please check logs above.
exit /b 1
