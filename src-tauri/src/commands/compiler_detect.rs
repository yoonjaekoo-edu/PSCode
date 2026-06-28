use serde::Serialize;
use tauri::Manager;

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

fn find_in_resource_dir(resource_dir: &std::path::Path) -> Option<String> {
    let candidates = [
        resource_dir.join("gcc/mingw64/bin/g++.exe"),
        resource_dir.join("gcc/bin/g++.exe"),
        resource_dir.join("mingw64/bin/g++.exe"),
    ];
    for p in &candidates {
        if p.is_file() {
            return Some(p.to_string_lossy().to_string());
        }
    }
    None
}

fn find_in_app_data(app_data_dir: &std::path::Path) -> Option<String> {
    let candidates = [
        app_data_dir.join("gcc/mingw64/bin/g++.exe"),
        app_data_dir.join("gcc/bin/g++.exe"),
        app_data_dir.join("gcc/w64devkit/mingw64/bin/g++.exe"),
        app_data_dir.join("gcc/ucrt64/bin/g++.exe"),
    ];
    for p in &candidates {
        if p.is_file() {
            return Some(p.to_string_lossy().to_string());
        }
    }
    None
}

#[tauri::command]
pub fn detect_compiler(
    app_handle: tauri::AppHandle,
    custom_path: Option<String>,
) -> CompilerInfo {
    if let Some(ref path) = custom_path {
        if !path.is_empty() && is_valid_compiler(path) {
            return CompilerInfo {
                path: path.clone(),
                found: true,
            };
        }
    }

    if let Ok(resource_dir) = app_handle.path().resource_dir() {
        if let Some(path) = find_in_resource_dir(&resource_dir) {
            return CompilerInfo { path, found: true };
        }
    }

    if let Ok(app_data_dir) = app_handle.path().app_data_dir() {
        if let Some(path) = find_in_app_data(&app_data_dir) {
            return CompilerInfo { path, found: true };
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

#[tauri::command]
pub async fn install_compiler(app_handle: tauri::AppHandle) -> Result<String, String> {
    #[cfg(windows)]
    {
        let app_data = app_handle
            .path()
            .app_data_dir()
            .map_err(|e| e.to_string())?;
        let gcc_dir = app_data.join("gcc");
        std::fs::create_dir_all(&gcc_dir).map_err(|e| e.to_string())?;
        let bin_dir = gcc_dir.join("mingw64/bin");
        let gpp_path = bin_dir.join("g++.exe");

        if gpp_path.is_file() {
            return Ok("Compiler already installed".to_string());
        }

        let sfx_name = "w64devkit-x64-2.8.0.7z.exe";
        let sfx_url = format!(
            "https://github.com/skeeto/w64devkit/releases/download/v2.8.0/{}",
            sfx_name
        );

        // First check if bundled in resources
        let sfx_source = if let Ok(resource_dir) = app_handle.path().resource_dir() {
            let bundled = resource_dir.join("gcc").join(sfx_name);
            if bundled.is_file() {
                Some(bundled)
            } else {
                None
            }
        } else {
            None
        };

        let sfx_path = gcc_dir.join(sfx_name);

        if let Some(bundled) = sfx_source {
            std::fs::copy(&bundled, &sfx_path).map_err(|e| e.to_string())?;
        } else {
            let script = format!(
                r#"
$ProgressPreference = 'Continue'
Write-Host "Downloading portable GCC (w64devkit)..."

$url = "{sfx_url}"
$out = "{sfx}"
try {{
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
    Write-Host "Download complete"
}} catch {{
    Write-Host "Download failed: $_"
    exit 1
}}
"#,
                sfx_url = sfx_url,
                sfx = sfx_path.to_string_lossy()
            );

            let output = std::process::Command::new("powershell")
                .arg("-NoProfile")
                .arg("-Command")
                .arg(&script)
                .output()
                .map_err(|e| format!("Failed to start download: {}", e))?;

            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Download failed: {}", stderr));
            }
        }

        // Extract the SFX archive
        let extract_script = format!(
            r#"
$sfx = "{sfx}"
$out = "{out}"
if (-not (Test-Path $sfx)) {{
    Write-Host "Archive not found: $sfx"
    exit 1
}}
Write-Host "Extracting GCC..."
try {{
    $p = Start-Process -FilePath $sfx -ArgumentList "-y","-o`"$out`"" -Wait -PassThru -NoNewWindow
    if ($p.ExitCode -ne 0) {{
        throw "SFX extraction failed with exit code $($p.ExitCode)"
    }}
    Write-Host "Extraction complete"
}} catch {{
    Write-Host "Extraction failed: $_"
    try {{
        & "C:\Program Files\7-Zip\7z.exe" x "$sfx" -o"$out" -y
    }} catch {{
        exit 1
    }}
}}
"#,
            sfx = sfx_path.to_string_lossy(),
            out = gcc_dir.to_string_lossy()
        );

        let extract_output = std::process::Command::new("powershell")
            .arg("-NoProfile")
            .arg("-Command")
            .arg(&extract_script)
            .output()
            .map_err(|e| format!("Failed to start extraction: {}", e))?;

        if !extract_output.status.success() {
            let stderr = String::from_utf8_lossy(&extract_output.stderr);
            // Try to find g++ even if extraction reported failure
            if !gpp_path.is_file() {
                return Err(format!("Extraction failed: {}", stderr));
            }
        }

        // Clean up the SFX archive
        let _ = std::fs::remove_file(&sfx_path);

        if gpp_path.is_file() {
            Ok("GCC installed successfully".to_string())
        } else {
            Err("GCC installation failed: g++ not found after extraction".to_string())
        }
    }

    #[cfg(not(windows))]
    {
        let _ = app_handle;
        Err("Automatic installation is only supported on Windows.".to_string())
    }
}
