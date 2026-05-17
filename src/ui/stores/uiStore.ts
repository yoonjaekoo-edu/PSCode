import { create } from "zustand";

interface UiState {
  settingsOpen: boolean;
  newProblemOpen: boolean;
  commandPaletteOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  setNewProblemOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  settingsOpen: false,
  newProblemOpen: false,
  commandPaletteOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setNewProblemOpen: (open) => set({ newProblemOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
