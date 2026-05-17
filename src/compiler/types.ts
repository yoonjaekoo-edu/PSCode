export interface RunOutput {
  success: boolean;
  compileOutput: string;
  runOutput: string;
  runError: string;
  executionTimeMs: number;
}
