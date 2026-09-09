@echo off
echo Starting Quick-Fashion...

echo Launching Backend...
start "Quick-Fashion Backend" cmd /k "cd /d %~dp0Backend\Expreserver && node index.js"

echo Launching Frontend...
start "Quick-Fashion Frontend" cmd /k "cd /d %~dp0Frontend && npm run dev"

echo Both servers are starting. Check the terminal windows.
