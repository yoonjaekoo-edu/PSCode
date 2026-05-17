export interface AppSettings {
  language: string;
  compilerPath: string;
  workspaceRoot: string;
  autosaveIntervalMs: number;
  recentFiles: string[];
  sidebarCollapsed: boolean;
  consoleHeight: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  compilerPath: "",
  workspaceRoot: "",
  autosaveIntervalMs: 800,
  recentFiles: [],
  sidebarCollapsed: false,
  consoleHeight: 200,
};
