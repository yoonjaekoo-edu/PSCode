use serde::Serialize;

#[derive(Serialize)]
pub struct CompilerInfo {
    pub path: String,
    pub found: bool,
}

fn candidate_paths() -> Vec<String> {
    let mut paths = Vec::new();

    #[cfg(windows)]
    {
        paths.push(r"C:\msys64\mingw64\bin\g++.exe".to_string());
        paths.push(r"C:\msys64\ucrt64\bin\g++.exe".to_string());
        paths.push(r"C:\MinGW\bin\g++.exe".to_string());
    }

    paths.push("g++".to_string());
    paths
}

fn is_valid_compiler(path: &str) -> bool {
    if path == "g++" {
        return which_gpp().is_some();
    }
    std::path::Path::new(path).is_file()
}

fn which_gpp() -> Option<String> {
    #[cfg(windows)]
    let cmd = "where";
    #[cfg(not(windows))]
    let cmd = "which";

    let output = std::process::Command::new(cmd).arg("g++").output().ok()?;
    if !output.status.success() {
        return None;
    }
    let stdout = String::from_utf8_lossy(&output.stdout);
    stdout.lines().next().map(|s| s.trim().to_string())
}

#[tauri::command]
pub async fn install_compiler() -> Result<String, String> {
    #[cfg(windows)]
    {
        let script = r#"
            $ProgressPreference = 'SilentlyContinue'
            Write-Host "Checking for MSYS2..."
            if (!(Test-Path C:\msys64)) {
                Write-Host "MSYS2 not found. Attempting to install via winget..."
                if (Get-Command winget -ErrorAction SilentlyContinue) {
                    winget install MSYS2.MSYS2 --silent --accept-package-agreements --accept-source-agreements
                } else {
                    Write-Host "winget not found. Downloading installer..."
                    $url = "https://github.com/msys2/msys2-installer/releases/download/2024-05-07/msys2-x86_64-20240507.exe"
                    $out = "$env:TEMP\msys2-installer.exe"
                    Invoke-WebRequest -Uri $url -OutFile $out
                    Write-Host "Running installer..."
                    Start-Process -FilePath $out -ArgumentList "--confirm-command --accept-messages --root C:\msys64" -Wait
                }
            }
            
            if (Test-Path C:\msys64\usr\bin\bash.exe) {
                Write-Host "Installing MinGW64 GCC..."
                Start-Process -FilePath "C:\msys64\usr\bin\bash.exe" -ArgumentList "-lc", "'pacman -S --noconfirm mingw-w64-x86_64-gcc'" -Wait
                return "Success"
            } else {
                throw "MSYS2 installation failed or path not found."
            }
        "#;

        let output = std::process::Command::new("powershell")
            .arg("-NoProfile")
            .arg("-Command")
            .arg(script)
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok("Compiler installed successfully".to_string())
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    #[cfg(not(windows))]
    {
        Err("Automatic installation is only supported on Windows.".to_string())
    }
}

#[tauri::command]
pub fn detect_compiler(custom_path: Option<String>) -> CompilerInfo {
    if let Some(ref path) = custom_path {
        if !path.is_empty() && is_valid_compiler(path) {
            return CompilerInfo {
                path: path.clone(),
                found: true,
            };
        }
    }

    for candidate in candidate_paths() {
        if candidate == "g++" {
            if let Some(found) = which_gpp() {
                return CompilerInfo {
                    path: found,
                    found: true,
                };
            }
        } else if is_valid_compiler(&candidate) {
            return CompilerInfo {
                path: candidate,
                found: true,
            };
        }
    }

    CompilerInfo {
        path: String::new(),
        found: false,
    }
}
