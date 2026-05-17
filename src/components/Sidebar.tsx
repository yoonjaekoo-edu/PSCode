import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/settings/settingsStore";
import { useEditorStore } from "@/editor/editorStore";
import { useWorkspaceStore } from "@/workspace/workspaceStore";
import { useUiStore } from "@/ui/stores/uiStore";
import { workspaceService } from "@/workspace/workspaceService";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const { t } = useTranslation();
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const todayFiles = useWorkspaceStore((s) => s.todayFiles);
  const recentFiles = useSettingsStore((s) => s.recentFiles);
  const currentPath = useEditorStore((s) => s.filePath);
  const setNewProblemOpen = useUiStore((s) => s.setNewProblemOpen);

  const toggleSidebar = async () => {
    const store = useSettingsStore.getState();
    store.updateSettings({ sidebarCollapsed: !collapsed });
    await store.persistSettings();
  };

  const openFile = async (path: string) => {
    await workspaceService.openFile(path);
  };

  if (collapsed) {
    return (
      <aside className="flex flex-col w-12 shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] items-center py-2 gap-2 transition-all duration-200">
        <IconButton title={t("sidebar.expand")} onClick={toggleSidebar}>
          →
        </IconButton>
        <IconButton title={t("sidebar.newProblem")} onClick={() => setNewProblemOpen(true)}>
          +
        </IconButton>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col w-56 shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] transition-all duration-200">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {t("app.title")}
        </span>
        <IconButton title={t("sidebar.collapse")} onClick={toggleSidebar}>
          ←
        </IconButton>
      </div>

      <button
        type="button"
        onClick={() => setNewProblemOpen(true)}
        className="mx-2 mt-2 px-3 py-1.5 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded transition-colors"
      >
        + {t("sidebar.newProblem")}
      </button>

      <Section title={t("sidebar.today")}>
        {todayFiles.length === 0 ? (
          <p className="px-3 py-1 text-xs text-[var(--text-muted)]">
            {t("sidebar.noFiles")}
          </p>
        ) : (
          todayFiles.map((file) => (
            <FileItem
              key={file.path}
              name={file.name}
              active={file.path === currentPath}
              onClick={() => openFile(file.path)}
            />
          ))
        )}
      </Section>

      {recentFiles.length > 0 && (
        <Section title={t("sidebar.recent")}>
          {recentFiles.slice(0, 10).map((path) => (
            <FileItem
              key={path}
              name={path.split(/[/\\]/).pop() ?? path}
              active={path === currentPath}
              onClick={() => openFile(path)}
            />
          ))}
        </Section>
      )}
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 flex-1 min-h-0 overflow-y-auto">
      <h3 className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {title}
      </h3>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function FileItem({
  name,
  active,
  onClick,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-1 text-sm truncate transition-colors",
        active
          ? "bg-[var(--bg-active)] text-white"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
      )}
    >
      {name}
    </button>
  );
}

function IconButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
    >
      {children}
    </button>
  );
}
