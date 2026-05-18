@echo off
title Weetech PWA Frontend (App) Indito
color 0B
echo ===================================================
echo          Weetech PWA App Inditasa...
echo ===================================================
echo.
echo Ez az ablak futtatja a webolalt (Frontend).
echo Kerlek ne zard be, amig hasznalod a programot!
echo.
cd /d "%~dp0"
start "" http://localhost:5173/
npm run dev

echo.
echo [HIBA] A szerver leallt!
pause
