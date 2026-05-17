import { useEffect } from "react";
import { useSettingsStore } from "@/settings/settingsStore";
import { useWorkspaceStore } from "@/workspace/workspaceStore";
import { workspaceService } from "@/workspace/workspaceService";

export function useAppInit() {
  const loaded = useSettingsStore((s) => s.loaded);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const refreshToday = useWorkspaceStore((s) => s.refreshToday);

  useEffect(() => {
    void (async () => {
      await loadSettings();
      const root = useSettingsStore.getState().workspaceRoot;
      if (root) {
        await workspaceService.ensureWorkspace();
      }
      await refreshToday();
    })();
  }, [loadSettings, refreshToday]);

  return { ready: loaded };
}
