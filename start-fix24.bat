@echo off
cd /d "%~dp0"
echo Starting Fix24 local server...
echo.
npm.cmd run dev -- --host 0.0.0.0 --port 5173
pause
