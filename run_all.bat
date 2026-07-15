@echo off
echo ==========================================
echo       Starting DriveGuard System
echo ==========================================

echo [1/3] Starting Backend (Spring Boot)...
start "DriveGuard Backend" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"

echo [2/3] Starting Frontend (React + Vite)...
start "DriveGuard Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"


echo ==========================================
echo All components initiated in separate windows.
echo ==========================================
pause
