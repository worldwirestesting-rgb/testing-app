@echo off
title Weetech Képméretező Backend Szerver
color 0A
echo ===================================================
echo       Weetech Képméretező Szerver Indítása...
echo ===================================================
echo.
echo Ez a szerver fogadja a képeket a telefonodról, 
echo és menti öket a beállított hálózati mappákba.
echo.
echo IP Cimeden lesz elerheto (a 3000-es porton).
echo Kerlek ne zard be ezt az ablakot, amig hasznalod!
echo.
cd /d "%~dp0"
npm run server

echo.
echo [HIBA] A szerver leallt!
pause
