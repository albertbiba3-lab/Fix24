@echo off
cd /d "%~dp0"
title Open Fix24
echo Starting Fix24 in a separate server window...
start "Fix24 Local Server" cmd /k "cd /d "%~dp0" && npm.cmd run dev -- --host 0.0.0.0 --port 5173"
timeout /t 5 /nobreak >nul
start http://localhost:5173/
echo.
echo If you want to open it from another device on the same Wi-Fi, use:
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /c:"IPv4 Address"') do echo http:%%A:5173/
echo.
pause
