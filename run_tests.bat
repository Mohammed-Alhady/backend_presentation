@echo off
setlocal
:: ==================================================================================
:: Project: Automated Performance Benchmarking Orchestrator
:: Author: Mohammed Alhady
:: Description: This script automates the entire benchmarking lifecycle:
::              1. Environment Cleanup.
::              2. Isolated Service Deployment.
::              3. Traffic Generation (k6 Stress Testing).
::              4. Resource Monitoring (Docker Stats).
::              5. Data Analysis & Dashboard Generation.
:: ==================================================================================

echo ===================================================
echo     Starting Automated Benchmarking Flow (Isolated)
echo ===================================================

:: المرحلة 0: التنظيف الأولي لضمان دقة القياسات
echo Cleaning up old data and containers...
docker compose down >nul 2>&1
del stats_vanilla.txt stats_beast.txt >nul 2>&1

:: المرحلة 1: اختبار Laravel العادي
echo.
echo ===================================================
echo [1] Testing Laravel Vanilla (Isolated Baseline)...
echo ===================================================
docker compose up -d laravel_vanilla
echo Waiting 10s for container warm-up...
timeout /t 10 /nobreak >nul
echo Attacking Laravel Vanilla...
k6 run -e URL=http://localhost:8000/ --summary-export=lv_k6.json attack.js
echo Capturing Final RAM Usage...
docker stats --no-stream --format "{{.Name}},{{.MemUsage}}" >> stats_vanilla.txt
docker compose down >nul 2>&1

:: المرحلة 2: اختبار .NET العادي
echo.
echo ===================================================
echo [2] Testing .NET Vanilla (Isolated Baseline)...
echo ===================================================
docker compose up -d dotnet_vanilla
echo Waiting 10s for container warm-up...
timeout /t 10 /nobreak >nul
echo Attacking .NET Vanilla...
k6 run -e URL=http://localhost:5000/ --summary-export=net_k6.json attack.js
echo Capturing Final RAM Usage...
docker stats --no-stream --format "{{.Name}},{{.MemUsage}}" >> stats_vanilla.txt
docker compose down >nul 2>&1

:: المرحلة 3: اختبار Laravel Octane (الخارق)
echo.
echo ===================================================
echo [3] Testing Laravel Octane (Isolated Performance)...
echo ===================================================
docker compose up -d laravel_beast
echo Waiting 10s for container warm-up...
timeout /t 10 /nobreak >nul
echo Attacking Laravel Octane...
k6 run -e URL=http://localhost:8001/ --summary-export=lv_beast_k6.json attack.js
echo Capturing Final RAM Usage...
docker stats --no-stream --format "{{.Name}},{{.MemUsage}}" >> stats_beast.txt
docker compose down >nul 2>&1

:: المرحلة 4: اختبار .NET Native AOT (الخارق)
echo.
echo ===================================================
echo [4] Testing .NET Native AOT (Isolated Performance)...
echo ===================================================
docker compose up -d dotnet_beast
echo Waiting 10s for container warm-up...
timeout /t 10 /nobreak >nul
echo Attacking .NET Native AOT...
k6 run -e URL=http://localhost:5001/ --summary-export=net_beast_k6.json attack.js
echo Capturing Final RAM Usage...
docker stats --no-stream --format "{{.Name}},{{.MemUsage}}" >> stats_beast.txt
docker compose down >nul 2>&1

:: المرحلة النهائية: التحليل والعرض
echo.
echo Processing raw data and generating dashboard...
node generate_dashboard.js

echo.
echo ===================================================
echo   BENCHMARKING COMPLETE - OPENING VISUALIZATION
echo ===================================================
start index.html
pause