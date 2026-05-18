# PSCode Build & Deploy Script
# Run this script to build the application and push changes to GitHub.

# Set UTF-8 encoding for console output to support ASCII art characters
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ASCII Art
Write-Host @"
██████╗ ███████╗
██╔══██╗██╔════╝
██████╔╝███████╗
██╔═══╝ ╚════██║
██║     ███████║
╚═╝     ╚══════╝

 ██████╗ ██████╗ ██████╗ ███████╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝
██║     ██║   ██║██║  ██║█████╗  
██║     ██║   ██║██║  ██║██╔══╝  
╚██████╗╚██████╔╝██████╔╝███████╗
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝

      PSCode Build & Deploy System
"@ -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

try {
    # 1. Build
    Write-Host "`n[1/3] Building Tauri Application (EXE)..." -ForegroundColor Yellow
    npm run tauri build

    # 2. Git Commit
    Write-Host "`n[2/3] Staging and Committing changes..." -ForegroundColor Yellow
    git add .
    $status = git status --porcelain
    if ($status) {
        git commit -m "build: production build and feature updates"
        Write-Host "Changes committed." -ForegroundColor Gray
    } else {
        Write-Host "No changes to commit." -ForegroundColor Gray
    }

    # 3. Git Push
    Write-Host "`n[3/3] Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  Success! PSCode has been deployed.    " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
}
catch {
    Write-Host "`n[!] An error occurred during deployment:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
