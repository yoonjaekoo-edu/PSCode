@echo off
title PSCode Deploy System
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\build-deploy.ps1"
pause
