import { create } from "zustand";

interface MarkdownState {
  filePath: string | null;
  content: string;
  splitRatio: number;
  openMdFile: (path: string, content: string) => void;
  closeMdFile: () => void;
  setSplitRatio: (ratio: number) => void;
}

export const useMarkdownStore = create<MarkdownState>((set) => ({
  filePath: null,
  content: "",
  splitRatio: 0.55,
  openMdFile: (path, content) => set({ filePath: path, content }),
  closeMdFile: () => set({ filePath: null, content: "" }),
  setSplitRatio: (ratio) => set({ splitRatio: Math.max(0.3, Math.min(0.85, ratio)) }),
}));
