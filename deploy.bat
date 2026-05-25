@echo off
title PSCode Deploy System
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\build-deploy.ps1"
pause
