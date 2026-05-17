use serde::Serialize;
use std::path::PathBuf;
use std::process::Stdio;
use std::time::Instant;

use super::compiler_detect::detect_compiler;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RunOutput {
    pub success: bool,
    pub compile_output: String,
    pub run_output: String,
    pub run_error: String,
    pub execution_time_ms: u64,
}

fn resolve_compiler(compiler_path: Option<String>) -> Result<String, String> {
    let info = detect_compiler(compiler_path);
    if info.found {
        Ok(info.path)
    } else {
        Err("Compiler not found. Install MSYS2 mingw64 g++ or set path in Settings.".to_string())
    }
}

fn exe_extension() -> &'static str {
    #[cfg(windows)]
    {
        ".exe"
    }
    #[cfg(not(windows))]
    {
        ""
    }
}

#[tauri::command]
pub async fn compile_and_run(
    source_path: String,
    input: String,
    compiler_path: Option<String>,
) -> Result<RunOutput, String> {
    let gpp = resolve_compiler(compiler_path)?;

    let source = PathBuf::from(&source_path);
    if !source.exists() {
        return Err(format!("Source file not found: {}", source_path));
    }

    let temp_dir = std::env::temp_dir().join("pscode");
    std::fs::create_dir_all(&temp_dir).map_err(|e| e.to_string())?;

    let stem = source
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("main");
    let exe_path = temp_dir.join(format!("{}{}", stem, exe_extension()));

    let compile_output = tauri::async_runtime::spawn_blocking({
        let gpp = gpp.clone();
        let source_path = source_path.clone();
        let exe_path = exe_path.clone();
        move || {
            let output = std::process::Command::new(&gpp)
                .args([
                    "-std=c++17",
                    "-O2",
                    "-pipe",
                    "-o",
                    exe_path.to_str().unwrap_or("pscode_out"),
                    &source_path,
                ])
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .output()
                .map_err(|e| format!("Failed to run compiler: {}", e))?;

            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let combined = if stderr.is_empty() {
                stdout
            } else {
                format!("{}\n{}", stdout, stderr)
            };

            Ok::<_, String>((output.status.success(), combined))
        }
    })
    .await
    .map_err(|e| e.to_string())??;

    let (compiled, compile_log) = compile_output;

    if !compiled {
        return Ok(RunOutput {
            success: false,
            compile_output: compile_log,
            run_output: String::new(),
            run_error: String::new(),
            execution_time_ms: 0,
        });
    }

    let run_result = tauri::async_runtime::spawn_blocking({
        let exe_path = exe_path.clone();
        let input = input.clone();
        move || {
            let start = Instant::now();
            let mut child = std::process::Command::new(&exe_path)
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn()
                .map_err(|e| format!("Failed to run program: {}", e))?;

            if let Some(stdin) = child.stdin.as_mut() {
                use std::io::Write;
                stdin
                    .write_all(input.as_bytes())
                    .map_err(|e| format!("Failed to write stdin: {}", e))?;
            }

            let output = child.wait_with_output().map_err(|e| e.to_string())?;
            let elapsed = start.elapsed().as_millis() as u64;

            Ok::<_, String>((
                String::from_utf8_lossy(&output.stdout).to_string(),
                String::from_utf8_lossy(&output.stderr).to_string(),
                output.status.success(),
                elapsed,
            ))
        }
    })
    .await
    .map_err(|e| e.to_string())??;

    let (run_output, run_error, run_ok, execution_time_ms) = run_result;

    Ok(RunOutput {
        success: run_ok,
        compile_output: compile_log,
        run_output,
        run_error,
        execution_time_ms,
    })
}
