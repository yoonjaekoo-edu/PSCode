import { create } from "zustand";

interface UiState {
  settingsOpen: boolean;
  newProblemOpen: boolean;
  commandPaletteOpen: boolean;
  snippetsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  setNewProblemOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSnippetsOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  settingsOpen: false,
  newProblemOpen: false,
  commandPaletteOpen: false,
  snippetsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setNewProblemOpen: (open) => set({ newProblemOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setSnippetsOpen: (open) => set({ snippetsOpen: open }),
}));
