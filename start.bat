@echo off
TITLE Ceylon Gold - Premium Cinnamon Experience
SETLOCAL EnableDelayedExpansion

:: --- CONFIG ---
SET PORT=5000
SET BACKEND_DIR=backend

echo.
echo  =============================================================
echo   Ceylon Gold - Local Deployment Assistant
echo  =============================================================
echo.

:: 1. Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/ to continue.
    pause
    exit /b
)

:: 2. Branding Update
if exist "replace.js" (
    echo [1/4] Applying brand transformations...
    node replace.js
)

:: 3. Clean up existing processes on port 5000
echo [2/4] Checking for existing server instances...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo [INFO] Found existing process %%a on port %PORT%. Cleaning up...
    taskkill /F /PID %%a >nul 2>&1
)

:: 4. Prepare Backend
if not exist "%BACKEND_DIR%" (
    echo [ERROR] Backend directory "%BACKEND_DIR%" not found.
    pause
    exit /b
)

cd /d "%~dp0%BACKEND_DIR%"

echo [3/4] Preparing Backend Server...
if not exist "node_modules" (
    echo [INFO] Installing dependencies (this may take a minute)...
    call npm install
)

:: Ensure uploads directory exists
if not exist "uploads" (
    mkdir uploads
)

:: 5. Launch
echo [4/4] Firing up the server...
:: Using cmd /k to keep the window open if the server crashes
start "Ceylon Gold Backend" cmd /k "node src/server.js"

echo Waiting for server to initialize (6s)...
timeout /t 6 /nobreak > nul

echo.
echo Launching Cinnamon Portal in your browser...
start http://localhost:%PORT%
start http://localhost:%PORT%/admin.html

echo.
echo  =============================================================
echo   SUCCESS! The system is now initializing.
echo   Check the Backend terminal window for database status.
echo  =============================================================
echo.
echo   If you see "MongoDB connection failed", the site will still
echo   run in "No-DB mode" for previewing the design.
echo.
pause
