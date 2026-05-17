use chrono::Local;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

const DEFAULT_TEMPLATE: &str = r#"#include <bits/stdc++.h>
using namespace std;

int main() {
ios::sync_with_stdio(0);
cin.tie(0);

}
"#;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TodayFile {
    pub path: String,
    pub name: String,
    pub modified_ms: u64,
}

pub fn default_workspace_root() -> PathBuf {
    if let Some(docs) = dirs::document_dir() {
        docs.join("PSCode")
    } else {
        dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("PSCode")
    }
}

pub fn today_folder(workspace_root: &str) -> PathBuf {
    let date = Local::now().format("%Y-%m-%d").to_string();
    PathBuf::from(workspace_root)
        .join("projects")
        .join(date)
}

pub fn sanitize_filename(name: &str) -> String {
    let lower = name.to_lowercase();
    let tokens: Vec<&str> = lower.split_whitespace().collect();

    // Try to extract first word and first number for "word_1234" style
    let first_word: String = tokens
        .first()
        .map(|t| {
            t.chars()
                .filter(|c| c.is_alphanumeric())
                .collect()
        })
        .unwrap_or_default();

    let number: String = tokens
        .iter()
        .find_map(|t| {
            let digits: String = t.chars().filter(|c| c.is_ascii_digit()).collect();
            if !digits.is_empty() {
                Some(digits)
            } else {
                None
            }
        })
        .unwrap_or_default();

    let base = if !first_word.is_empty() && !number.is_empty() {
        format!("{}_{}", first_word, number)
    } else {
        let sanitized: String = lower
            .chars()
            .map(|c| {
                if c.is_alphanumeric() {
                    c
                } else {
                    '_'
                }
            })
            .collect();
        let mut result = String::new();
        let mut prev_underscore = false;
        for c in sanitized.chars() {
            if c == '_' {
                if !prev_underscore && !result.is_empty() {
                    result.push('_');
                    prev_underscore = true;
                }
            } else {
                result.push(c);
                prev_underscore = false;
            }
        }
        result.trim_matches('_').to_string()
    };

    if base.is_empty() {
        "untitled".to_string()
    } else if base.ends_with(".cpp") {
        base
    } else {
        format!("{}.cpp", base)
    }
}

#[tauri::command]
pub fn ensure_workspace(workspace_root: String) -> Result<String, String> {
    let root = if workspace_root.is_empty() {
        default_workspace_root()
    } else {
        PathBuf::from(workspace_root)
    };

    fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    fs::create_dir_all(today_folder(root.to_str().unwrap_or(""))).map_err(|e| e.to_string())?;

    Ok(root.to_string_lossy().to_string())
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub fn list_today_files(workspace_root: String) -> Result<Vec<TodayFile>, String> {
    let folder = today_folder(&workspace_root);
    if !folder.exists() {
        return Ok(Vec::new());
    }

    let mut files = Vec::new();
    let entries = fs::read_dir(&folder).map_err(|e| e.to_string())?;

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("cpp") {
            continue;
        }
        let meta = entry.metadata().map_err(|e| e.to_string())?;
        let modified_ms = meta
            .modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);

        files.push(TodayFile {
            name: path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("unknown")
                .to_string(),
            path: path.to_string_lossy().to_string(),
            modified_ms,
        });
    }

    files.sort_by(|a, b| b.modified_ms.cmp(&a.modified_ms));
    Ok(files)
}

#[tauri::command]
pub fn create_problem_file(
    workspace_root: String,
    problem_name: String,
    template: Option<String>,
) -> Result<String, String> {
    let root = if workspace_root.is_empty() {
        default_workspace_root()
    } else {
        PathBuf::from(workspace_root)
    };

    let folder = today_folder(root.to_str().unwrap_or(""));
    fs::create_dir_all(&folder).map_err(|e| e.to_string())?;

    let filename = sanitize_filename(&problem_name);
    let file_path = folder.join(&filename);

    if file_path.exists() {
        return Err(format!("File already exists: {}", filename));
    }

    let content = template.unwrap_or_else(|| DEFAULT_TEMPLATE.to_string());
    fs::write(&file_path, content).map_err(|e| e.to_string())?;

    Ok(file_path.to_string_lossy().to_string())
}
