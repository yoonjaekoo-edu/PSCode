import { create } from "zustand";
import { workspaceService } from "@/workspace/workspaceService";
import { useSettingsStore } from "@/settings/settingsStore";

type SaveStatus = "saved" | "unsaved" | "saving";

interface EditorState {
  filePath: string | null;
  content: string;
  dirty: boolean;
  saveStatus: SaveStatus;
  autosaveTimer: ReturnType<typeof setTimeout> | null;
  setContent: (content: string) => void;
  openFile: (path: string, content: string) => void;
  saveFile: () => Promise<void>;
  scheduleAutosave: () => void;
  clearAutosave: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  filePath: null,
  content: "",
  dirty: false,
  saveStatus: "saved",
  autosaveTimer: null,

  setContent: (content) => {
    set({ content, dirty: true, saveStatus: "unsaved" });
    get().scheduleAutosave();
  },

  openFile: (path, content) => {
    get().clearAutosave();
    set({
      filePath: path,
      content,
      dirty: false,
      saveStatus: "saved",
    });
  },

  saveFile: async () => {
    const { filePath, content } = get();
    if (!filePath) return;

    set({ saveStatus: "saving" });
    try {
      await workspaceService.saveFile(filePath, content);
      set({ dirty: false, saveStatus: "saved" });
    } catch {
      set({ saveStatus: "unsaved" });
    }
  },

  scheduleAutosave: () => {
    const { autosaveTimer } = get();
    if (autosaveTimer) clearTimeout(autosaveTimer);

    const interval = useSettingsStore.getState().autosaveIntervalMs;
    const timer = setTimeout(() => {
      void get().saveFile();
    }, interval);

    set({ autosaveTimer: timer });
  },

  clearAutosave: () => {
    const { autosaveTimer } = get();
    if (autosaveTimer) clearTimeout(autosaveTimer);
    set({ autosaveTimer: null });
  },
}));
