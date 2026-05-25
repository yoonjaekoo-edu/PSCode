import { invoke } from "@tauri-apps/api/core";
import { useEditorStore } from "@/editor/editorStore";
import { useMarkdownStore } from "@/editor/markdownStore";
import { useSettingsStore } from "@/settings/settingsStore";
import { DEFAULT_CPP_TEMPLATE } from "./defaultTemplate";
import type { TodayFile, FileEntry } from "./types";

const MAX_RECENT = 20;

const CODE_EXTENSIONS = new Set(["cpp", "h", "hpp"]);

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
    const ext = path.split(".").pop()?.toLowerCase() ?? "";

    if (ext === "md") {
      useMarkdownStore.getState().openMdFile(path, content);
      const cppPath = path.replace(/\.md$/i, ".cpp");
      try {
        const cppContent = await this.readFile(cppPath);
        useEditorStore.getState().openFile(cppPath, cppContent);
      } catch {
        // No matching .cpp file
      }
    } else if (CODE_EXTENSIONS.has(ext)) {
      useEditorStore.getState().openFile(path, content);
      const mdPath = path.replace(/\.(cpp|h|hpp)$/i, ".md");
      try {
        const mdContent = await this.readFile(mdPath);
        useMarkdownStore.getState().openMdFile(mdPath, mdContent);
      } catch {
        useMarkdownStore.getState().closeMdFile();
      }
    } else {
      useEditorStore.getState().openFile(path, content);
      useMarkdownStore.getState().closeMdFile();
    }

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

  async listDirectoryRecursive(): Promise<FileEntry[]> {
    const root = useSettingsStore.getState().workspaceRoot;
    return invoke<FileEntry[]>("list_directory_recursive", { workspaceRoot: root });
  },

  async createFile(path: string): Promise<void> {
    await invoke("create_file", { path });
  },

  async createDirectory(path: string): Promise<void> {
    await invoke("create_directory", { path });
  },

  async renameItem(oldPath: string, newPath: string): Promise<void> {
    await invoke("rename_item", { oldPath, newPath });
  },

  async deleteItem(path: string): Promise<void> {
    await invoke("delete_item", { path });
  },
};
