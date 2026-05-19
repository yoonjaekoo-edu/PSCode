pub mod compile;
pub mod compiler_detect;
pub mod fs_ops;
pub mod settings;

pub use compile::compile_and_run;
pub use compiler_detect::{detect_compiler, install_compiler};
pub use fs_ops::{
    create_problem_file, ensure_workspace, list_today_files, read_file, write_file,
};
pub use settings::{get_settings, save_settings};
