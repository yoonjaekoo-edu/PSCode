import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/workspace/workspaceStore";
import { workspaceService } from "@/workspace/workspaceService";
import { useEditorStore } from "@/editor/editorStore";
import type { FileEntry } from "@/workspace/types";
import { cn } from "@/lib/cn";

export function WorkspaceTree() {
  const { t } = useTranslation();
  const currentPath = useEditorStore((s) => s.filePath);
  const refreshToday = useWorkspaceStore((s) => s.refreshToday);
  
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});
  
  // File manager interaction states
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    path: string;
    isDir: boolean;
    name: string;
  } | null>(null);
  const [creating, setCreating] = useState<{
    parentPath: string;
    type: "file" | "dir";
  } | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);

  const loadTree = async () => {
    try {
      const data = await workspaceService.listDirectoryRecursive();
      setFiles(data);
    } catch (err) {
      console.error("Failed to load workspace tree:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTree();
  }, []);

  // Listen for global clicks to close context menu
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const toggleExpand = (path: string, forceState?: boolean) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: forceState !== undefined ? forceState : !prev[path],
    }));
  };

  const openFile = async (path: string) => {
    try {
      await workspaceService.openFile(path);
      await refreshToday();
    } catch (err) {
      console.error("Failed to open file:", err);
    }
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    entry: FileEntry
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      path: entry.path,
      isDir: entry.isDir,
      name: entry.name,
    });
  };

  const triggerCreateInline = (parentPath: string, type: "file" | "dir") => {
    setCreating({ parentPath, type });
    setExpandedPaths((prev) => ({ ...prev, [parentPath]: true }));
  };

  const triggerRenameInline = (path: string) => {
    setRenamingPath(path);
  };

  const handleDelete = async (path: string, name: string) => {
    const confirmDelete = window.confirm(
      `정말로 '${name}'을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며, 모든 하위 항목이 제거됩니다.`
    );
    if (!confirmDelete) return;

    try {
      await workspaceService.deleteItem(path);
      if (currentPath === path) {
        useEditorStore.getState().openFile("", "");
      }
      await loadTree();
      await refreshToday();
    } catch (err) {
      alert(`삭제 실패: ${err}`);
    }
  };

  // Root level creators
  const handleRootCreate = async (name: string, type: "file" | "dir") => {
    if (!name.trim()) return;
    try {
      const rootPath = files.length > 0
        ? files[0].path.substring(0, files[0].path.lastIndexOf(files[0].name))
        : "";
      
      const fullPath = rootPath ? `${rootPath}${name.trim()}` : name.trim();
      
      if (type === "file") {
        await workspaceService.createFile(fullPath);
      } else {
        await workspaceService.createDirectory(fullPath);
      }
      await loadTree();
    } catch (err) {
      alert(`생성 실패: ${err}`);
    }
  };

  if (loading) {
    return (
      <div className="px-3 py-4 text-xs text-[var(--text-muted)] animate-pulse">
        {t("workspace.loading")}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 select-none">
      {/* Root actions toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
        <span className="text-xs font-semibold uppercase tracking-wide">
          {t("workspace.files")}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="새 파일 생성"
            onClick={() => {
              const name = window.prompt("생성할 파일 이름을 입력해 주세요 (예: problem_1000.cpp):");
              if (name) void handleRootCreate(name, "file");
            }}
            className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] p-0.5 rounded transition-colors"
          >
            <NewFileIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="새 폴더 생성"
            onClick={() => {
              const name = window.prompt("생성할 폴더 이름을 입력해 주세요:");
              if (name) void handleRootCreate(name, "dir");
            }}
            className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] p-0.5 rounded transition-colors"
          >
            <NewFolderIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="새로고침"
            onClick={() => void loadTree()}
            className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] p-0.5 rounded transition-colors"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Directory Tree Scroll Area */}
      <div className="flex-1 overflow-y-auto py-1 font-mono text-xs">
        {files.length === 0 ? (
          <p className="px-3 py-2 text-xs text-[var(--text-muted)] italic">
            {t("workspace.empty")}
          </p>
        ) : (
          files.map((entry) => (
            <TreeNode
              key={entry.path}
              entry={entry}
              depth={0}
              expandedPaths={expandedPaths}
              toggleExpand={toggleExpand}
              onFileClick={openFile}
              onContextMenu={handleContextMenu}
              creating={creating}
              setCreating={setCreating}
              renamingPath={renamingPath}
              setRenamingPath={setRenamingPath}
              refresh={loadTree}
              triggerCreateInline={triggerCreateInline}
              triggerRenameInline={triggerRenameInline}
            />
          ))
        )}
      </div>

      {/* Custom Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 min-w-44 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded shadow-2xl py-1 backdrop-blur-md pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.isDir && (
            <>
              <ContextMenuItem
                onClick={() => {
                  setContextMenu(null);
                  triggerCreateInline(contextMenu.path, "file");
                }}
              >
                <NewFileIcon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span>새 파일 생성</span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  setContextMenu(null);
                  triggerCreateInline(contextMenu.path, "dir");
                }}
              >
                <NewFolderIcon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span>새 폴더 생성</span>
              </ContextMenuItem>
              <div className="h-px bg-[var(--border)] my-1" />
            </>
          )}
          <ContextMenuItem
            onClick={() => {
              setContextMenu(null);
              triggerRenameInline(contextMenu.path);
            }}
          >
            <PencilIcon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span>이름 바꾸기</span>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              setContextMenu(null);
              void handleDelete(contextMenu.path, contextMenu.name);
            }}
            danger
          >
            <TrashIcon className="w-3.5 h-3.5 text-[var(--error)]" />
            <span>삭제</span>
          </ContextMenuItem>
        </div>
      )}
    </div>
  );
}

// CONTEXT MENU ITEM
function ContextMenuItem({
  children,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-xs transition-colors",
        danger
          ? "text-[var(--error)] hover:bg-[var(--error)]/10"
          : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

// TREE NODE RECURSIVE COMPONENT
interface TreeNodeProps {
  entry: FileEntry;
  depth: number;
  expandedPaths: Record<string, boolean>;
  toggleExpand: (path: string, forceState?: boolean) => void;
  onFileClick: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, entry: FileEntry) => void;
  creating: { parentPath: string; type: "file" | "dir" } | null;
  setCreating: (val: { parentPath: string; type: "file" | "dir" } | null) => void;
  renamingPath: string | null;
  setRenamingPath: (path: string | null) => void;
  refresh: () => void;
  triggerCreateInline: (parentPath: string, type: "file" | "dir") => void;
  triggerRenameInline: (path: string) => void;
}

function TreeNode({
  entry,
  depth,
  expandedPaths,
  toggleExpand,
  onFileClick,
  onContextMenu,
  creating,
  setCreating,
  renamingPath,
  setRenamingPath,
  refresh,
  triggerCreateInline,
  triggerRenameInline,
}: TreeNodeProps) {
  const currentPath = useEditorStore((s) => s.filePath);
  const isExpanded = !!expandedPaths[entry.path];
  const isActive = currentPath === entry.path;
  const isRenaming = renamingPath === entry.path;
  const [renameVal, setRenameVal] = useState(entry.name);
  const [createVal, setCreateVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = async () => {
    if (!renameVal.trim() || renameVal === entry.name) {
      setRenamingPath(null);
      return;
    }
    try {
      const lastSlash = Math.max(entry.path.lastIndexOf("/"), entry.path.lastIndexOf("\\"));
      const parent = lastSlash !== -1 ? entry.path.substring(0, lastSlash) : "";
      const sep = entry.path.includes("\\") ? "\\" : "/";
      const newPath = parent ? `${parent}${sep}${renameVal.trim()}` : renameVal.trim();
      
      await workspaceService.renameItem(entry.path, newPath);
      if (isActive) {
        // If active file was renamed, reopen it!
        await workspaceService.openFile(newPath);
      }
      refresh();
    } catch (err) {
      alert(`이름 변경 실패: ${err}`);
    } finally {
      setRenamingPath(null);
    }
  };

  const handleCreateSubmit = async () => {
    if (!createVal.trim() || !creating) {
      setCreating(null);
      setCreateVal("");
      return;
    }
    try {
      const sep = entry.path.includes("\\") ? "\\" : "/";
      const newPath = `${entry.path}${sep}${createVal.trim()}`;
      if (creating.type === "file") {
        await workspaceService.createFile(newPath);
        // Automatically open the new file!
        if (newPath.endsWith(".cpp")) {
          await workspaceService.openFile(newPath);
        }
      } else {
        await workspaceService.createDirectory(newPath);
      }
      toggleExpand(entry.path, true);
      refresh();
    } catch (err) {
      alert(`생성 실패: ${err}`);
    } finally {
      setCreating(null);
      setCreateVal("");
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Node row */}
      <div
        className={cn(
          "group flex items-center justify-between py-1 pr-2 hover:bg-[var(--bg-hover)] cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all",
          isActive && "bg-[var(--bg-active)] text-white hover:bg-[var(--bg-active)]"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (isRenaming) return;
          if (entry.isDir) {
            toggleExpand(entry.path);
          } else {
            onFileClick(entry.path);
          }
        }}
        onContextMenu={(e) => onContextMenu(e, entry)}
      >
        <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
          {/* Chevron for dir */}
          {entry.isDir ? (
            <ChevronIcon
              className={cn(
                "w-3 h-3 text-[var(--text-muted)] shrink-0 transition-transform duration-150",
                isExpanded && "rotate-90"
              )}
            />
          ) : (
            <span className="w-3 shrink-0" />
          )}

          {/* Folder / File icon */}
          {entry.isDir ? (
            <FolderIcon className="w-3.5 h-3.5 text-yellow-600/90 shrink-0" />
          ) : entry.name.endsWith(".cpp") ? (
            <CppIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          ) : entry.name.endsWith(".md") ? (
            <MdIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          ) : (
            <FileIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          )}

          {/* Text or Input */}
          {isRenaming ? (
            <input
              ref={inputRef}
              value={renameVal}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setRenameVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleRenameSubmit();
                if (e.key === "Escape") setRenamingPath(null);
              }}
              onBlur={() => void handleRenameSubmit()}
              className="w-full px-1 py-0.5 bg-[var(--bg-primary)] border border-[var(--accent)] rounded text-[var(--text-primary)] outline-none"
            />
          ) : (
            <span className="truncate py-0.5">{entry.name}</span>
          )}
        </div>

        {/* Hover Action Buttons for quick file management */}
        {!isRenaming && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-1">
            {entry.isDir && (
              <>
                <button
                  type="button"
                  title="새 파일"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerCreateInline(entry.path, "file");
                  }}
                  className="hover:text-white hover:bg-[var(--bg-tertiary)] p-0.5 rounded transition-colors"
                >
                  <NewFileIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="새 폴더"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerCreateInline(entry.path, "dir");
                  }}
                  className="hover:text-white hover:bg-[var(--bg-tertiary)] p-0.5 rounded transition-colors"
                >
                  <NewFolderIcon className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              type="button"
              title="이름 바꾸기"
              onClick={(e) => {
                e.stopPropagation();
                triggerRenameInline(entry.path);
              }}
              className="hover:text-white hover:bg-[var(--bg-tertiary)] p-0.5 rounded transition-colors"
            >
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Children list */}
      {entry.isDir && isExpanded && (
        <div className="w-full flex flex-col">
          {/* Inline creation input inside directory */}
          {creating && creating.parentPath === entry.path && (
            <div
              className="flex items-center gap-1.5 py-1 pr-2 border-l border-[var(--border)] ml-1"
              style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
            >
              <span className="w-3 shrink-0" />
              {creating.type === "file" ? (
                <FileIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              ) : (
                <FolderIcon className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
              )}
              <input
                autoFocus
                value={createVal}
                placeholder={creating.type === "file" ? "파일명.cpp" : "폴더명"}
                onChange={(e) => setCreateVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleCreateSubmit();
                  if (e.key === "Escape") setCreating(null);
                }}
                onBlur={() => void handleCreateSubmit()}
                className="w-full px-1 py-0.5 bg-[var(--bg-primary)] border border-[var(--accent)] rounded text-[var(--text-primary)] outline-none"
              />
            </div>
          )}

          {entry.children &&
            entry.children.map((child) => (
              <TreeNode
                key={child.path}
                entry={child}
                depth={depth + 1}
                expandedPaths={expandedPaths}
                toggleExpand={toggleExpand}
                onFileClick={onFileClick}
                onContextMenu={onContextMenu}
                creating={creating}
                setCreating={setCreating}
                renamingPath={renamingPath}
                setRenamingPath={setRenamingPath}
                refresh={refresh}
                triggerCreateInline={triggerCreateInline}
                triggerRenameInline={triggerRenameInline}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// --- PREMIUM SVG ICONS ---

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M10 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
    </svg>
  );
}

function MdIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12c.79 0 1.44.63 1.44 1.41v9.18c0 .78-.65 1.41-1.44 1.41zM6.81 15.19v-3.66l1.92 2.35 1.92-2.35v3.66h1.93V8.81h-1.93l-1.92 2.35-1.92-2.35H4.88v6.38h1.93zm9.62-1.36l-2.81-3.63h1.74V8.81h1.93v1.39h1.74l-2.81 3.63v1.36h1.93v-1.36z" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
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
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
      <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
  );
}

function CppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.2 13.5c-.8 0-1.5-.3-2.1-.8-.5-.5-.8-1.2-.8-2.1v-1.2c0-.9.3-1.6.8-2.1.6-.5 1.3-.8 2.1-.8.8 0 1.5.3 2 .8.4.4.6.9.6 1.4h-1.5c0-.2-.1-.4-.2-.5-.2-.1-.5-.2-.8-.2-.3 0-.6.1-.8.3-.2.2-.3.6-.3 1v1.3c0 .5.1.8.3 1 .2.2.5.3.8.3.3 0 .6-.1.8-.3.1-.1.2-.3.2-.5h1.5c0 .5-.2 1-.6 1.4-.5.5-1.2.8-2 .8zm7.2-2.5h-1v1h-1v-1h-1v-1h1v-1h1v1h1v1zm1.5-2.5h-1v1h-1v-1h-1v-1h1v-1h1v1h1v1z" />
    </svg>
  );
}

function NewFileIcon({ className }: { className?: string }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="12" y1="18" x2="12" y2="12"></line>
      <line x1="9" y1="15" x2="15" y2="15"></line>
    </svg>
  );
}

function NewFolderIcon({ className }: { className?: string }) {
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
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      <line x1="12" y1="11" x2="12" y2="17"></line>
      <line x1="9" y1="14" x2="15" y2="14"></line>
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
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
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
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
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
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
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
    </svg>
  );
}
