import { useTranslation } from "react-i18next";
import { useTestcaseStore } from "./testcaseStore";
import { cn } from "@/lib/cn";

export function TestcasePanel() {
  const { t } = useTranslation();
  const input = useTestcaseStore((s) => s.input);
  const collapsed = useTestcaseStore((s) => s.collapsed);
  const setInput = useTestcaseStore((s) => s.setInput);
  const toggleCollapsed = useTestcaseStore((s) => s.toggleCollapsed);

  return (
    <div
      className={cn(
        "border-t border-[var(--border)] bg-[var(--bg-secondary)] shrink-0 transition-all duration-200",
        collapsed ? "h-8" : "h-[120px]",
      )}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <span>{t("testcase.title")}</span>
        <span>{collapsed ? "▲" : "▼"}</span>
      </button>
      {!collapsed && (
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("testcase.placeholder")}
          className="w-full h-[calc(100%-28px)] px-3 py-1 bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-mono resize-none outline-none border-none"
          spellCheck={false}
        />
      )}
    </div>
  );
}
