@echo off
title Claude Codex Koprusu
cd /d "%~dp0.."
set ANTHROPIC_API_KEY=
node bridge\watcher.js
echo.
echo Kopru durdu. Hata mesajini yukarida gorebilirsiniz.
pause
