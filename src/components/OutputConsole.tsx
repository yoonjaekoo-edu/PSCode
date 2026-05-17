import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useConsoleStore } from "@/ui/stores/consoleStore";
import { cn } from "@/lib/cn";

export function OutputConsole() {
  const { t } = useTranslation();
  const visible = useConsoleStore((s) => s.visible);
  const activeTab = useConsoleStore((s) => s.activeTab);
  const buildOutput = useConsoleStore((s) => s.buildOutput);
  const runOutput = useConsoleStore((s) => s.runOutput);
  const running = useConsoleStore((s) => s.running);
  const setActiveTab = useConsoleStore((s) => s.setActiveTab);

  if (!visible) return null;

  const output = activeTab === "build" ? buildOutput : runOutput;
  const isEmpty = !output && !running;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[var(--bg-secondary)]">
      <div className="flex items-center gap-1 px-2 border-b border-[var(--border)] shrink-0">
        <TabButton
          active={activeTab === "build"}
          onClick={() => setActiveTab("build")}
          label={t("console.build")}
        />
        <TabButton
          active={activeTab === "run"}
          onClick={() => setActiveTab("run")}
          label={t("console.run")}
        />
        {running && (
          <span className="ml-auto text-xs text-[var(--accent)] animate-pulse">
            {t("console.running")}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.pre
            key={`${activeTab}-${output}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "p-3 text-sm font-mono whitespace-pre-wrap min-h-full",
              activeTab === "build" && buildOutput && !running
                ? "text-[var(--error)]"
                : "text-[var(--text-primary)]",
            )}
          >
            {isEmpty ? t("console.empty") : output}
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs transition-colors border-b-2",
        active
          ? "border-[var(--accent)] text-[var(--text-primary)]"
          : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
      )}
    >
      {label}
    </button>
  );
}
