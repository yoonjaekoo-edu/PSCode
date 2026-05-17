import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/ui/stores/uiStore";
import { useSettingsStore } from "@/settings/settingsStore";
import { useEditorStore } from "@/editor/editorStore";
import { useConsoleStore } from "@/ui/stores/consoleStore";
import { useCompileRun } from "@/compiler/useCompileRun";
import { cn } from "@/lib/cn";

interface Command {
  id: string;
  labelKey: string;
  action: () => void | Promise<void>;
}

export function CommandPalette() {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const setNewProblemOpen = useUiStore((s) => s.setNewProblemOpen);
  const { run } = useCompileRun();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      {
        id: "newProblem",
        labelKey: "command.newProblem",
        action: () => setNewProblemOpen(true),
      },
      {
        id: "run",
        labelKey: "command.run",
        action: run,
      },
      {
        id: "save",
        labelKey: "command.save",
        action: () => useEditorStore.getState().saveFile(),
      },
      {
        id: "settings",
        labelKey: "command.settings",
        action: () => setSettingsOpen(true),
      },
      {
        id: "toggleSidebar",
        labelKey: "command.toggleSidebar",
        action: async () => {
          const s = useSettingsStore.getState();
          s.updateSettings({ sidebarCollapsed: !s.sidebarCollapsed });
          await s.persistSettings();
        },
      },
      {
        id: "toggleConsole",
        labelKey: "command.toggleConsole",
        action: () => useConsoleStore.getState().toggleVisible(),
      },
      {
        id: "langKo",
        labelKey: "command.switchLangKo",
        action: () => useSettingsStore.getState().setLanguage("ko"),
      },
      {
        id: "langEn",
        labelKey: "command.switchLangEn",
        action: () => useSettingsStore.getState().setLanguage("en"),
      },
    ],
    [run, setNewProblemOpen, setSettingsOpen],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter((cmd) =>
      t(cmd.labelKey).toLowerCase().includes(q),
    );
  }, [commands, query, t]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  if (!open) return null;

  const execute = async (cmd: Command) => {
    setOpen(false);
    await cmd.action();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[index]) {
      e.preventDefault();
      void execute(filtered[index]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("command.placeholder")}
          className="w-full px-4 py-3 bg-transparent border-b border-[var(--border)] text-[var(--text-primary)] outline-none"
        />
        <ul className="max-h-64 overflow-y-auto py-1">
          {filtered.map((cmd, i) => (
            <li key={cmd.id}>
              <button
                type="button"
                onClick={() => void execute(cmd)}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm transition-colors",
                  i === index
                    ? "bg-[var(--bg-active)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]",
                )}
              >
                {t(cmd.labelKey)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
