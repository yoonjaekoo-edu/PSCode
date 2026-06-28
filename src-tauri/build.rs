fn main() {
    let placeholder = std::path::Path::new("resources/gcc/mingw64/placeholder");
    if !placeholder.exists() {
        std::fs::create_dir_all(placeholder.parent().unwrap()).ok();
        std::fs::write(placeholder, "").ok();
    }
    tauri_build::build()
}
