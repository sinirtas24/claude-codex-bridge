@echo off
setlocal
cd /d "%~dp0"
title Basit Claude Sistemi Kurulumu

git config user.name "Claude Bridge"
git config user.email "sinirtas24@users.noreply.github.com"

node --check bridge\simple-watcher.js
if errorlevel 1 goto :error

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws=New-Object -ComObject WScript.Shell; $s=$ws.CreateShortcut([Environment]::GetFolderPath('Desktop')+'\Claude Koprusunu Baslat.lnk'); $s.TargetPath='%~dp0bridge\start-simple-bridge.bat'; $s.WorkingDirectory='%~dp0'; $s.Save()"
if errorlevel 1 goto :error

echo.
echo Kurulum tamamlandi. Masaustune 'Claude Koprusunu Baslat' kisayolu eklendi.
echo Kopru simdi baslatiliyor...
start "" "%~dp0bridge\start-simple-bridge.bat"
timeout /t 3 >nul
exit /b 0

:error
echo.
echo Kurulum tamamlanamadi.
pause
exit /b 1
