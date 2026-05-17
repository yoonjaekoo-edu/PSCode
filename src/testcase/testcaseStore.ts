import { create } from "zustand";

interface TestcaseState {
  input: string;
  collapsed: boolean;
  setInput: (input: string) => void;
  toggleCollapsed: () => void;
}

export const useTestcaseStore = create<TestcaseState>((set) => ({
  input: "",
  collapsed: false,
  setInput: (input) => set({ input }),
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
}));
