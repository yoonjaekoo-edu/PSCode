import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/settings/settingsStore";
import { useEditorStore } from "@/editor/editorStore";
import { useWorkspaceStore } from "@/workspace/workspaceStore";
import { useUiStore } from "@/ui/stores/uiStore";
import { workspaceService } from "@/workspace/workspaceService";
import { cn } from "@/lib/cn";
import { WorkspaceTree } from "./WorkspaceTree";

export function Sidebar() {
  const { t } = useTranslation();
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const todayFiles = useWorkspaceStore((s) => s.todayFiles);
  const recentFiles = useSettingsStore((s) => s.recentFiles);
  const currentPath = useEditorStore((s) => s.filePath);
  const setNewProblemOpen = useUiStore((s) => s.setNewProblemOpen);
  const setSnippetsOpen = useUiStore((s) => (s as any).setSnippetsOpen);

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
      <aside className="flex flex-col w-12 shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] items-center py-2 gap-3 transition-all duration-200">
        <IconButton title={t("sidebar.expand")} onClick={toggleSidebar}>
          →
        </IconButton>
        <IconButton title={t("sidebar.newProblem")} onClick={() => setNewProblemOpen(true)}>
          +
        </IconButton>
        <IconButton
          title="문제 MD 만들기"
          onClick={async () => {
            const cppPath = useEditorStore.getState().filePath;
            if (cppPath && cppPath.match(/\.(cpp|h|hpp)$/i)) {
              await workspaceService.createProblemMd(cppPath);
              await useWorkspaceStore.getState().refreshToday();
            }
          }}
        >
          <MdIcon className="w-4 h-4 text-[var(--text-secondary)] hover:text-white" />
        </IconButton>
        <IconButton title="STL 스니펫 목록" onClick={() => setSnippetsOpen?.(true)}>
          <SnippetIcon className="w-4 h-4 text-[var(--text-secondary)] hover:text-white" />
        </IconButton>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col w-56 shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] transition-all duration-200 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {t("app.title")}
          </span>
        </div>
        <IconButton title={t("sidebar.collapse")} onClick={toggleSidebar}>
          ←
        </IconButton>
      </div>

      {/* Buttons */}
      <div className="px-2 pt-2 pb-1.5 shrink-0 flex flex-col gap-1.5 border-b border-[var(--border)]">
        <button
          type="button"
          onClick={() => setNewProblemOpen(true)}
          className="w-full px-3 py-1.5 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded transition-colors font-medium cursor-pointer"
        >
          + {t("sidebar.newProblem")}
        </button>
        <button
          type="button"
          onClick={async () => {
            const cppPath = useEditorStore.getState().filePath;
            if (cppPath && (cppPath.endsWith(".cpp") || cppPath.endsWith(".h") || cppPath.endsWith(".hpp"))) {
              await workspaceService.createProblemMd(cppPath);
              await useWorkspaceStore.getState().refreshToday();
            }
          }}
          disabled={!currentPath || !currentPath.match(/\.(cpp|h|hpp)$/i)}
          className={cn(
            "w-full px-3 py-1.5 text-xs rounded transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer",
            currentPath?.match(/\.(cpp|h|hpp)$/i)
              ? "bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)]"
              : "bg-[var(--bg-tertiary)]/50 border border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed"
          )}
        >
          <MdIcon className="w-3.5 h-3.5" />
          <span>문제 MD 만들기</span>
        </button>
        <button
          type="button"
          onClick={() => setSnippetsOpen?.(true)}
          className="w-full px-3 py-1.5 text-xs bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] rounded transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <SnippetIcon className="w-3.5 h-3.5" />
          <span>STL 스니펫 목록</span>
        </button>
      </div>

      {/* Main Workspace Explorer (takes maximum available space, self scrolls) */}
      <div className="flex-1 min-h-0 border-b border-[var(--border)] flex flex-col">
        <WorkspaceTree />
      </div>

      {/* Secondary Collapsible Panels (Today, Recent) */}
      <div className="h-44 shrink-0 overflow-y-auto bg-[var(--bg-secondary)] flex flex-col border-t border-[var(--border)]/30">
        <Section title={t("sidebar.today")} defaultExpanded={true}>
          {todayFiles.length === 0 ? (
            <p className="px-7 py-1 text-[11px] text-[var(--text-muted)] italic">
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
          <Section title={t("sidebar.recent")} defaultExpanded={false}>
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
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
  defaultExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="mt-1 flex flex-col shrink-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-3 py-1.5 w-full text-left text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer select-none"
      >
        <span
          className={cn(
            "text-[8px] transition-transform duration-100 shrink-0",
            expanded ? "rotate-90" : ""
          )}
        >
          ▶
        </span>
        <span>{title}</span>
      </button>
      {expanded && <div className="mt-0.5 flex flex-col">{children}</div>}
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
        "w-full text-left pl-7 pr-3 py-1 text-xs truncate transition-colors cursor-pointer",
        active
          ? "bg-[var(--bg-active)] text-white"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
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
      className="w-8 h-8 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

function MdIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12c.79 0 1.44.63 1.44 1.41v9.18c0 .78-.65 1.41-1.44 1.41zM6.81 15.19v-3.66l1.92 2.35 1.92-2.35v3.66h1.93V8.81h-1.93l-1.92 2.35-1.92-2.35H4.88v6.38h1.93zm9.62-1.36l-2.81-3.63h1.74V8.81h1.93v1.39h1.74l-2.81 3.63v1.36h1.93v-1.36z" />
    </svg>
  );
}

function SnippetIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
      <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
  );
}

