import { invoke } from "@tauri-apps/api/core";
import type { RunOutput } from "./types";

export const compilerService = {
  async compileAndRun(
    sourcePath: string,
    input: string,
    compilerPath?: string,
  ): Promise<RunOutput> {
    return invoke<RunOutput>("compile_and_run", {
      sourcePath,
      input,
      compilerPath: compilerPath || null,
    });
  },

  async detectCompiler(customPath?: string) {
    return invoke<{ path: string; found: boolean }>("detect_compiler", {
      customPath: customPath || null,
    });
  },
};
