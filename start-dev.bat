@echo off
echo Starting Arogyam-360 Development Servers...
echo.

REM Start Frontend in a new window
start "Arogyam360 - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Backend in a new window  
start "Arogyam360 - Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo.
echo Frontend and Backend servers are starting in separate windows.
echo Close those windows to stop the servers.
echo.
pause
