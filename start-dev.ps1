# Arogyam-360 Development Server Launcher
# This script starts both frontend and backend servers in separate windows

Write-Host "Starting Arogyam-360 Development Servers..." -ForegroundColor Green

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

# Wait a moment before starting backend
Start-Sleep -Seconds 2

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

Write-Host "`nFrontend and Backend servers are starting in separate windows." -ForegroundColor Green
Write-Host "Close those windows to stop the servers.`n" -ForegroundColor Yellow
