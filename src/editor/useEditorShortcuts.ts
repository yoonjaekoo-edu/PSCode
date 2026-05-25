import { useEffect } from "react";
import { KeyCode, KeyMod, type editor } from "monaco-editor";
import { open } from "@tauri-apps/plugin-dialog";
import { useEditorStore } from "./editorStore";
import { useEditorRefStore } from "./editorRefStore";
import { useUiStore } from "@/ui/stores/uiStore";
import { useConsoleStore } from "@/ui/stores/consoleStore";
import { useSettingsStore } from "@/settings/settingsStore";
import { workspaceService } from "@/workspace/workspaceService";

interface ShortcutHandlers {
  onRun: () => void;
}

export function useEditorShortcuts(
  editorRef: editor.IStandaloneCodeEditor | null,
  handlers: ShortcutHandlers,
) {
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      if (e.key === "F5") {
        e.preventDefault();
        handlers.onRun();
        return;
      }

      if (mod && e.key === "Enter") {
        e.preventDefault();
        handlers.onRun();
        return;
      }

      if (mod && e.key === "s") {
        e.preventDefault();
        void useEditorStore.getState().saveFile();
        return;
      }

      if (mod && e.key === "o") {
        e.preventDefault();
        void (async () => {
          const selected = await open({
            multiple: false,
            filters: [
              { name: "C++ / Markdown", extensions: ["cpp", "h", "hpp", "md"] },
            ],
          });
          if (selected && typeof selected === "string") {
            await workspaceService.openFile(selected);
          }
        })();
        return;
      }

      if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        useUiStore.getState().setCommandPaletteOpen(true);
        return;
      }

      if (mod && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        useEditorRefStore.getState().editorRef
          ?.getAction("editor.action.formatDocument")
          ?.run();
        return;
      }

      if (mod && e.key === "n") {
        e.preventDefault();
        useUiStore.getState().setNewProblemOpen(true);
        return;
      }

      if (mod && e.key === ",") {
        e.preventDefault();
        useUiStore.getState().setSettingsOpen(true);
        return;
      }

      if (mod && e.key === "b") {
        e.preventDefault();
        useSettingsStore.getState().updateSettings({
          sidebarCollapsed: !sidebarCollapsed,
        });
        void useSettingsStore.getState().persistSettings();
        return;
      }

      if (mod && e.key === "`") {
        e.preventDefault();
        useConsoleStore.getState().toggleVisible();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers, sidebarCollapsed]);

  useEffect(() => {
    if (!editorRef) return;

    editorRef.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => handlers.onRun());
    editorRef.addCommand(KeyCode.F5, () => handlers.onRun());
    editorRef.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyF, () => {
      editorRef.getAction("editor.action.formatDocument")?.run();
    });
  }, [editorRef, handlers]);
}
