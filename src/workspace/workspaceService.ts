import { invoke } from "@tauri-apps/api/core";
import { useEditorStore } from "@/editor/editorStore";
import { useSettingsStore } from "@/settings/settingsStore";
import { DEFAULT_CPP_TEMPLATE } from "./defaultTemplate";
import type { TodayFile } from "./types";

const MAX_RECENT = 20;

export const workspaceService = {
  async ensureWorkspace(): Promise<string> {
    const root = useSettingsStore.getState().workspaceRoot;
    return invoke<string>("ensure_workspace", { workspaceRoot: root });
  },

  async listTodayFiles(): Promise<TodayFile[]> {
    const root = useSettingsStore.getState().workspaceRoot;
    return invoke<TodayFile[]>("list_today_files", { workspaceRoot: root });
  },

  async readFile(path: string): Promise<string> {
    return invoke<string>("read_file", { path });
  },

  async saveFile(path: string, content: string): Promise<void> {
    await invoke("write_file", { path, content });
  },

  async createProblem(problemName: string): Promise<string> {
    const root = useSettingsStore.getState().workspaceRoot;
    const path = await invoke<string>("create_problem_file", {
      workspaceRoot: root,
      problemName,
      template: DEFAULT_CPP_TEMPLATE,
    });
    await this.addRecentFile(path);
    return path;
  },

  async openFile(path: string): Promise<void> {
    const content = await this.readFile(path);
    useEditorStore.getState().openFile(path, content);
    await this.addRecentFile(path);
  },

  async addRecentFile(path: string): Promise<void> {
    const store = useSettingsStore.getState();
    const recent = [
      path,
      ...store.recentFiles.filter((f) => f !== path),
    ].slice(0, MAX_RECENT);
    store.updateSettings({ recentFiles: recent });
    await store.persistSettings();
  },
};
