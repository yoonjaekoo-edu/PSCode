param(
    [string]$OutputDir,
    [switch]$Force
)

$ScriptDir = if ($OutputDir) { $OutputDir } else { Join-Path $PSScriptRoot "..\src-tauri\resources\gcc" }
$ScriptDir = (Resolve-Path $ScriptDir -ea 0) ?? (New-Item -ItemType Directory -Path $ScriptDir -Force).FullName

$Version = "v2.8.0"
$Url = "https://github.com/skeeto/w64devkit/releases/download/$Version/w64devkit-x64-$Version.7z.exe"
$ArchivePath = Join-Path $ScriptDir "w64devkit-x64-$Version.7z.exe"
$ExtractDir = Join-Path $ScriptDir "mingw64"
$StampFile = Join-Path $ScriptDir ".extracted"

if ((Test-Path $ExtractDir) -and (Test-Path $StampFile) -and (-not $Force)) {
    Write-Host "[gcc] Already extracted at: $ExtractDir"
    exit 0
}

if (-not (Test-Path $ArchivePath)) {
    Write-Host "[gcc] Downloading w64devkit $Version ($Url)..."
    try {
        Invoke-WebRequest -Uri $Url -OutFile $ArchivePath -UseBasicParsing
        Write-Host "[gcc] Downloaded: $ArchivePath"
    } catch {
        Write-Host "[gcc] Download failed: $_"
        Write-Host "[gcc] Falling back to local MSYS2..."

        $msysPaths = @(
            "C:\msys64\ucrt64",
            "C:\msys64\mingw64",
            "C:\MinGW\mingw64",
            "C:\MinGW\bin"
        )
        $found = $false
        foreach ($mp in $msysPaths) {
            $gpp = Join-Path $mp "bin\g++.exe"
            if (Test-Path $gpp) {
                Write-Host "[gcc] Found local g++ at: $gpp"
                Copy-Item -Path $mp -Destination $ExtractDir -Recurse -Force
                $found = $true
                break
            }
        }
        if (-not $found) {
            Write-Host "[gcc] ERROR: Could not locate g++. Please install MSYS2 or w64devkit manually."
            exit 1
        }
    }
} else {
    Write-Host "[gcc] Archive already exists: $ArchivePath"
}

if (Test-Path $ArchivePath) {
    Write-Host "[gcc] Extracting..."
    $tempDir = Join-Path $ScriptDir "_tmp"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

    try {
        $proc = Start-Process -FilePath $ArchivePath -ArgumentList "-y", "-o`"$tempDir`"" -Wait -PassThru -NoNewWindow
        if ($proc.ExitCode -ne 0) {
            Write-Host "[gcc] SFX extraction failed (exit code $($proc.ExitCode)), trying 7z..."
            $7zPaths = @(
                "C:\Program Files\7-Zip\7z.exe",
                "C:\Program Files (x86)\7-Zip\7z.exe",
                (Get-Command "7z" -ea 0).Source
            )
            $extracted = $false
            foreach ($7z in $7zPaths) {
                if ($7z -and (Test-Path $7z)) {
                    $r = & $7z x "$ArchivePath" -o"$tempDir" -y 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        $extracted = $true
                        break
                    }
                }
            }
            if (-not $extracted) {
                Write-Host "[gcc] Could not extract. 7-Zip not found."
                exit 1
            }
        }
    } catch {
        Write-Host "[gcc] Extraction error: $_"
        exit 1
    }

    # Find the extracted mingw64 directory (could be in a subfolder)
    $foundMingw = Get-ChildItem $tempDir -Directory -Recurse -Depth 2 | Where-Object { $_.Name -eq "mingw64" } | Select-Object -First 1
    if ($foundMingw) {
        if (Test-Path $ExtractDir) { Remove-Item -Path $ExtractDir -Recurse -Force }
        Move-Item -Path $foundMingw.FullName -Destination $ExtractDir -Force
    } else {
        # Might be extracted directly into tempDir
        $gppCheck = Get-ChildItem $tempDir -Recurse -Filter "g++.exe" | Select-Object -First 1
        if ($gppCheck) {
            Move-Item -Path "$tempDir\*" -Destination $ExtractDir -Force
        } else {
            Write-Host "[gcc] Could not locate extracted g++"
            exit 1
        }
    }

    Remove-Item -Path $tempDir -Recurse -Force
    Set-Content -Path $StampFile -Value (Get-Date -Format "o")
    Write-Host "[gcc] Extracted to: $ExtractDir"
}

Write-Host "[gcc] Done"
