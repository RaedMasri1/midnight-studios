@echo off
cd /d "%~dp0"
title Midnight Studios v0.6.1
where node >nul 2>nul
if errorlevel 1 (
 echo Please install Node.js 22.13 or newer and try again.
 pause
 exit /b 1
)
echo Midnight Studios VERSION 0.6.1
echo Open http://localhost:3061 - this version uses a separate port from older previews.
echo Verify version at http://localhost:3061/__version
echo Preparing the preview images, then starting the website...
node scripts/serve-export.mjs --port 3061
pause
