@echo off
echo Inditjuk a Pin Kereso PWA alkalmazast...
cd /d "%~dp0"
start "" http://localhost:5173/
npm run dev
