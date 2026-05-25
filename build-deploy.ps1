# PSCode Build & Deploy Script
# Run this script to build the application and push changes to GitHub.

param(
    [string]$CommitMessage
)

# Set UTF-8 encoding for console output to support ASCII art characters
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

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
$WarningPreference = "SilentlyContinue"

# Get Commit Message if not provided as argument
if (-not $CommitMessage) {
    Write-Host "`n[Prompt] Please enter a commit message." -ForegroundColor White
    $CommitMessage = Read-Host "Commit message (press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        $CommitMessage = "build: production build and feature updates"
    }
}

try {
    # 1. Git Commit
    Write-Host "`n[1/2] Staging and Committing changes..." -ForegroundColor Yellow
    git add .
    $status = git status --porcelain
    if ($status) {
        git commit -m "$CommitMessage" --quiet
        Write-Host "Changes committed with message: $CommitMessage" -ForegroundColor Gray
    } else {
        Write-Host "No changes to commit." -ForegroundColor Gray
    }

    # 2. Git Push
    Write-Host "`n[2/3] Pushing to GitHub (main)..." -ForegroundColor Yellow
    git push origin main --quiet

    # 3. Create Release Tag (Optional)
    Write-Host "`n[3/3] Deployment Options" -ForegroundColor Yellow
    $DoRelease = Read-Host "Create a new release tag and deploy? (y/n)"
    if ($DoRelease -eq 'y') {
        $Version = Read-Host "Enter version tag (e.g., v1.0.0)"
        if (-not [string]::IsNullOrWhiteSpace($Version)) {
            if (-not $Version.StartsWith("v")) { $Version = "v$Version" }
            Write-Host "Creating and pushing tag: $Version..." -ForegroundColor Cyan
            git tag $Version
            git push origin $Version --quiet
            Write-Host "Tag pushed! GitHub Actions will now start the build & release process." -ForegroundColor Green
        } else {
            Write-Host "No version entered. Skipping release." -ForegroundColor Gray
        }
    } else {
        Write-Host "Skipping release process." -ForegroundColor Gray
    }

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  Success! Changes have been processed. " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
}
catch {
    Write-Host "`n[!] An error occurred during deployment:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
