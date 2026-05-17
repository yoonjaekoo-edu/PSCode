import { useTranslation } from "react-i18next";
import { useEditorStore } from "@/editor/editorStore";
import { useSettingsStore } from "@/settings/settingsStore";
import { useUiStore } from "@/ui/stores/uiStore";

export function StatusBar() {
  const { t } = useTranslation();
  const filePath = useEditorStore((s) => s.filePath);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const compilerFound = useSettingsStore((s) => s.compilerFound);
  const language = useSettingsStore((s) => s.language);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);

  const fileName = filePath
    ? filePath.split(/[/\\]/).pop()
    : t("app.untitled");

  const statusLabel =
    saveStatus === "saving"
      ? t("status.saving")
      : saveStatus === "unsaved"
        ? t("status.unsaved")
        : t("status.saved");

  return (
    <footer className="flex items-center gap-4 px-3 py-1 text-xs bg-[var(--accent)] text-white shrink-0">
      <button
        type="button"
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-1.5 px-2 py-0.5 -ml-1 hover:bg-white/10 rounded transition-colors"
        title={t("shortcuts.palette")}
      >
        <span className="text-[10px] border border-white/40 px-1 rounded opacity-80">
          ⌘P
        </span>
        {t("command.palette")}
      </button>

      <div className="h-3 w-[1px] bg-white/20 mx-1" />

      <span className="truncate max-w-[40%]">{fileName}</span>
      <span>{statusLabel}</span>
      <span className="ml-auto">
        {compilerFound ? t("compiler.found") : t("compiler.notFound")}
      </span>
      <span className="uppercase">{language}</span>
      <span className="opacity-80">{t("shortcuts.run")}</span>
    </footer>
  );
}
