@echo off
echo Starting Quick-Fashion...

echo Launching Backend...
start "Quick-Fashion Backend" /D "%~dp0Backend\Expreserver" node index.js

echo Launching Frontend...
start "Quick-Fashion Frontend" /D "%~dp0Frontend" npm run dev

echo Both servers are starting. Check the terminal windows.
