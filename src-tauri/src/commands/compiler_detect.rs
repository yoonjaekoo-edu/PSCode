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
