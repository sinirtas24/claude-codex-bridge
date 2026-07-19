@echo off
title Basit Claude Koprusu
cd /d "%~dp0.."
set ANTHROPIC_API_KEY=
node bridge\simple-watcher.js
echo.
echo Kopru durdu. Yukaridaki hata mesajini ChatGPT'ye gonderebilirsiniz.
pause
