@echo off
setlocal

title NoteBridge launcher
cd /d "%~dp0"

echo.
echo  ==========================================
echo       NoteBridge - local development app
echo  ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Please install Node.js 20 or newer from https://nodejs.org/
  echo Then double-click run.bat again.
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please reinstall Node.js 20 or newer.
  echo.
  pause
  exit /b 1
)

for /f "tokens=1" %%v in ('node -v') do set NODE_VERSION=%%v
echo Using Node.js %NODE_VERSION%

if not exist "node_modules\.bin\concurrently.cmd" goto install
if not exist "node_modules\.bin\vite.cmd" goto install
if not exist "node_modules\.bin\tsx.cmd" goto install
echo Dependencies are already installed.
goto start

:install
echo Installing NoteBridge dependencies. This may take a minute...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo Dependency installation failed. Check your internet connection and try again.
  echo.
  pause
  exit /b 1
)

:start
echo.
echo Starting the frontend and API...
echo The browser will open at http://localhost:5173
echo Keep this window open while using NoteBridge.
echo.

start "NoteBridge server and frontend" /d "%~dp0" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "" http://localhost:5173

echo NoteBridge is running. You can close this launcher window.
endlocal
