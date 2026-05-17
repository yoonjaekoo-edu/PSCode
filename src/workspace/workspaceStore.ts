import { create } from "zustand";
import type { TodayFile } from "./types";
import { workspaceService } from "./workspaceService";

interface WorkspaceState {
  todayFiles: TodayFile[];
  refreshToday: () => Promise<void>;
  setTodayFiles: (files: TodayFile[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  todayFiles: [],
  setTodayFiles: (files) => set({ todayFiles: files }),
  refreshToday: async () => {
    const files = await workspaceService.listTodayFiles();
    set({ todayFiles: files });
  },
}));
