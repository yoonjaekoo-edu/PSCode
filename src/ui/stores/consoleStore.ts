import { create } from "zustand";

type ConsoleTab = "build" | "run";

interface ConsoleState {
  visible: boolean;
  activeTab: ConsoleTab;
  buildOutput: string;
  runOutput: string;
  running: boolean;
  setVisible: (visible: boolean) => void;
  toggleVisible: () => void;
  setActiveTab: (tab: ConsoleTab) => void;
  setBuildOutput: (text: string) => void;
  setRunOutput: (text: string) => void;
  setRunning: (running: boolean) => void;
}

export const useConsoleStore = create<ConsoleState>((set) => ({
  visible: true,
  activeTab: "run",
  buildOutput: "",
  runOutput: "",
  running: false,
  setVisible: (visible) => set({ visible }),
  toggleVisible: () => set((s) => ({ visible: !s.visible })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setBuildOutput: (text) => set({ buildOutput: text }),
  setRunOutput: (text) => set({ runOutput: text }),
  setRunning: (running) => set({ running }),
}));
